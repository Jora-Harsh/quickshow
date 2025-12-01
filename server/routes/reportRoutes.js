// server/routes/reportRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import moment from "moment";
import ExcelJS from "exceljs";
import PdfPrinter from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

import User from "../models/userModel.js";
import Booking from "../models/Bookings.js";
import Movie from "../models/Movie.js";

const router = express.Router();

// -------------------------------------------------------------------------------------
//  PDF FONT HANDLING
// -------------------------------------------------------------------------------------
const detectVFS = (fontsModule) => {
  return (
    fontsModule?.pdfMake?.vfs ||
    fontsModule?.vfs ||
    fontsModule?.default?.pdfMake?.vfs ||
    fontsModule?.default?.vfs ||
    null
  );
};

const vfs = detectVFS(pdfFonts);

const getFontsMapping = () => {
  if (vfs) {
    const loadFont = (name) => {
      const file = vfs[name] || vfs[name.replace(".ttf", "")];
      return file ? Buffer.from(file, "base64") : null;
    };

    return {
      Roboto: {
        normal: loadFont("Roboto-Regular.ttf"),
        bold: loadFont("Roboto-Medium.ttf"),
        italics: loadFont("Roboto-Italic.ttf"),
        bolditalics: loadFont("Roboto-MediumItalic.ttf"),
      },
    };
  }

  // Windows fallback
  return {
    Roboto: {
      normal: fs.readFileSync("C:/Windows/Fonts/arial.ttf"),
      bold: fs.readFileSync("C:/Windows/Fonts/arialbd.ttf"),
      italics: fs.readFileSync("C:/Windows/Fonts/ariali.ttf"),
      bolditalics: fs.readFileSync("C:/Windows/Fonts/arialbi.ttf"),
    },
  };
};

const printer = new PdfPrinter(getFontsMapping());

// Optional logo
const loadLogo = () => {
  const logoPath = path.join(process.cwd(), "uploads", "logo.png");
  if (fs.existsSync(logoPath)) {
    return `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  }
  return null;
};

const logoBase64 = loadLogo();

// -------------------------------------------------------------------------------------
//  DATE FILTER HANDLER
// -------------------------------------------------------------------------------------
const dateFilter = (req) => {
  const { from, to } = req.query;
  if (!from && !to) return {};

  let filter = {};
  filter.createdAt = {};

  if (from) filter.createdAt.$gte = new Date(from);
  if (to) filter.createdAt.$lte = new Date(to + "T23:59:59");

  return filter;
};

// =====================================================================================
//  USERS EXCEL
// =====================================================================================
router.get("/users/excel", async (req, res) => {
  try {
    const filter = dateFilter(req);
    const users = await User.find(filter).sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Users");

    sheet.columns = [
      { header: "Sr No", key: "sr", width: 8 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 35 },
      { header: "Created At", key: "created", width: 20 },
    ];

    users.forEach((u, i) =>
      sheet.addRow({
        sr: i + 1,
        name: u.name,
        email: u.email,
        created: moment(u.createdAt).format("DD-MM-YYYY"),
      })
    );

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.log("Users Excel Error:", err);
    res.status(500).send("Excel generation failed");
  }
});

// =====================================================================================
//  BOOKINGS EXCEL
// =====================================================================================
router.get("/bookings/excel", async (req, res) => {
  try {
    const filter = dateFilter(req);

    const bookings = await Booking.find(filter)
      .populate("user", "name email")
      .populate({ path: "show", populate: { path: "movie", model: "Movie" } })
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bookings");

    sheet.columns = [
      { header: "Sr", key: "sr", width: 6 },
      { header: "User", key: "user", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Movie", key: "movie", width: 30 },
      { header: "Theater", key: "theater", width: 12 },
      { header: "Date", key: "date", width: 12 },
      { header: "ShowTime", key: "showTime", width: 18 },
      { header: "Amount", key: "amount", width: 10 },
      { header: "Seats", key: "seats", width: 25 },
    ];

    bookings.forEach((b, i) =>
      sheet.addRow({
        sr: i + 1,
        user: b.user?.name || "N/A",
        email: b.user?.email || "N/A",
        movie: b.show?.movie?.title || "N/A",
        theater: b.theater,
        date: moment(b.date).format("DD-MM-YYYY"),
        showTime: moment(b.showTime).format("DD-MM-YYYY HH:mm"),
        amount: b.amount,
        seats: b.bookedSeats.join(", "),
      })
    );

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.log("Bookings Excel Error:", err);
    res.status(500).send("Excel generation failed");
  }
});

// =====================================================================================
//  USERS PDF
// =====================================================================================
router.get("/users/pdf", async (req, res) => {
  try {
    const filter = dateFilter(req);
    const users = await User.find(filter).sort({ createdAt: -1 });

    const tableBody = [
      [
        { text: "Sr", style: "tableHeader" },
        { text: "Name", style: "tableHeader" },
        { text: "Email", style: "tableHeader" },
        { text: "Created", style: "tableHeader" },
      ],
    ];

    users.forEach((u, i) =>
      tableBody.push([
        { text: i + 1, alignment: "center" },
        { text: u.name },
        { text: u.email },
        { text: moment(u.createdAt).format("DD-MM-YYYY"), alignment: "center" },
      ])
    );

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [20, 60, 20, 40],
      content: [
        { text: "Users Report", style: "title" },
        {
          table: { headerRows: 1, widths: [30, "*", "*", 70], body: tableBody },
        },
      ],
      styles: {
        title: { fontSize: 18, bold: true, marginBottom: 10 },
        tableHeader: { bold: true, fillColor: "#1d4ed8", color: "white" },
      },
      defaultStyle: { font: "Roboto", fontSize: 10 },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=users.pdf");

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.log("Users PDF Error:", err);
    res.status(500).send("PDF generation failed");
  }
});

// =====================================================================================
//  BOOKINGS PDF (FINAL FIXED VERSION WITH FORMATTED DATE + TIME)
// =====================================================================================
router.get("/bookings/pdf", async (req, res) => {
  try {
    const filter = dateFilter(req);

    const bookings = await Booking.find(filter)
      .populate("user", "name email")
      .populate({ path: "show", populate: { path: "movie", model: "Movie" } })
      .sort({ createdAt: -1 });

    const tableBody = [
      [
        { text: "Sr", style: "tableHeader" },
        { text: "User", style: "tableHeader" },
        { text: "Email", style: "tableHeader" },
        { text: "Movie", style: "tableHeader" },
        { text: "Theater", style: "tableHeader" },
        { text: "Date", style: "tableHeader" },
        { text: "Show Time", style: "tableHeader" },
        { text: "Amount", style: "tableHeader" },
        { text: "Seats", style: "tableHeader" },
      ],
    ];

    bookings.forEach((b, i) => {
      const formattedDate = moment(b.date).format("DD-MM-YYYY");
      const formattedShowTime = moment(b.showTime).format("DD-MM-YYYY HH:mm");

      tableBody.push([
        { text: i + 1, alignment: "center" },
        { text: b.user?.name || "N/A" },
        { text: b.user?.email || "N/A" },
        { text: b.show?.movie?.title || "N/A" },
        { text: b.theater },
        { text: formattedDate, alignment: "center" },
        { text: formattedShowTime, alignment: "center" }, // << FIXED
        { text: `₹${b.amount}`, alignment: "right" },
        { text: b.bookedSeats.join(", "), noWrap: false },
      ]);
    });

    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [15, 60, 15, 40],
      content: [
        { text: "Bookings Report", style: "title" },
        {
          table: {
            headerRows: 1,
            widths: [25, 70, 140, 200, 70, 60, 80, 60, "*"],
            body: tableBody,
          },
        },
      ],
      styles: {
        title: { fontSize: 18, bold: true, marginBottom: 10 },
        tableHeader: {
          bold: true,
          fillColor: "#1d4ed8",
          color: "white",
          alignment: "center",
        },
      },
      defaultStyle: { font: "Roboto", fontSize: 9 },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bookings.pdf");

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    console.log("Bookings PDF Error:", err);
    res.status(500).send("PDF generation failed");
  }
});

export default router;
