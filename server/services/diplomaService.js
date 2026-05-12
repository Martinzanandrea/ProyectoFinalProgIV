// ============================================================
// diplomaService.js
// Genera un PDF de diploma con código QR usando pdfkit + qrcode
// Ubicación: server/services/diplomaService.js
// ============================================================
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

/**
 * Genera el PDF del diploma y lo escribe en el response de Express.
 * @param {object} res - Response de Express
 * @param {object} data - { inscripcion, estudiante, curso }
 */
async function generarDiplomaPDF(res, { inscripcion, estudiante, curso }) {
  // Generar QR con el ID de la inscripción
  const qrData = `Inscripcion ID: ${inscripcion.id_inscripcion}`;
  const qrImageBuffer = await QRCode.toBuffer(qrData, {
    type: "png",
    width: 120,
    margin: 1,
  });

  // Crear documento PDF
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
  });

  // Headers para descarga
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="diploma_inscripcion_${inscripcion.id_inscripcion}.pdf"`,
  );

  // Pipe del PDF al response
  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 60;

  // ── Fondo decorativo ──────────────────────────────────────
  // Borde exterior dorado
  doc
    .rect(
      margin - 20,
      margin - 20,
      pageWidth - (margin - 20) * 2,
      pageHeight - (margin - 20) * 2,
    )
    .lineWidth(3)
    .strokeColor("#B8860B")
    .stroke();

  // Borde interior fino
  doc
    .rect(
      margin - 10,
      margin - 10,
      pageWidth - (margin - 10) * 2,
      pageHeight - (margin - 10) * 2,
    )
    .lineWidth(1)
    .strokeColor("#DAA520")
    .stroke();

  // ── Encabezado ────────────────────────────────────────────
  doc
    .fontSize(11)
    .fillColor("#8B6914")
    .font("Helvetica")
    .text("INSTITUTO DE FORMACIÓN PROFESIONAL", margin, margin + 10, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  doc
    .fontSize(32)
    .fillColor("#2C3E50")
    .font("Helvetica-Bold")
    .text("DIPLOMA DE PARTICIPACIÓN", margin, margin + 40, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  // Línea decorativa
  const lineY = margin + 90;
  doc
    .moveTo(margin + 40, lineY)
    .lineTo(pageWidth - margin - 40, lineY)
    .lineWidth(1.5)
    .strokeColor("#B8860B")
    .stroke();

  // ── Cuerpo ────────────────────────────────────────────────
  doc
    .fontSize(14)
    .fillColor("#555555")
    .font("Helvetica")
    .text("Se certifica que:", margin, lineY + 25, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  // Nombre del estudiante
  doc
    .fontSize(28)
    .fillColor("#1A252F")
    .font("Helvetica-Bold")
    .text(`${estudiante.nombre} ${estudiante.apellido}`, margin, lineY + 55, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  // Documento
  doc
    .fontSize(11)
    .fillColor("#777777")
    .font("Helvetica")
    .text(`Documento: ${estudiante.documento}`, margin, lineY + 100, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  doc
    .fontSize(13)
    .fillColor("#555555")
    .text("ha completado exitosamente el curso:", margin, lineY + 125, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  // Nombre del curso
  doc
    .fontSize(22)
    .fillColor("#1A5276")
    .font("Helvetica-Bold")
    .text(`"${curso.nombre}"`, margin, lineY + 150, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  // Descripción del curso
  if (curso.descripcion) {
    doc
      .fontSize(10)
      .fillColor("#888888")
      .font("Helvetica-Oblique")
      .text(curso.descripcion, margin + 80, lineY + 185, {
        align: "center",
        width: pageWidth - (margin + 80) * 2,
      });
  }

  // ── Fecha ─────────────────────────────────────────────────
  const fechaInscripcion = new Date(
    inscripcion.fecha_hora_inscripcion,
  ).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc
    .fontSize(11)
    .fillColor("#555555")
    .font("Helvetica")
    .text(`Fecha de inscripción: ${fechaInscripcion}`, margin, lineY + 215, {
      align: "center",
      width: pageWidth - margin * 2,
    });

  // ── QR Code (abajo a la derecha) ──────────────────────────
  const qrSize = 90;
  const qrX = pageWidth - margin - qrSize - 10;
  const qrY = pageHeight - margin - qrSize - 30;

  doc.image(qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize });

  doc
    .fontSize(7)
    .fillColor("#999999")
    .font("Helvetica")
    .text(`ID: ${inscripcion.id_inscripcion}`, qrX, qrY + qrSize + 4, {
      width: qrSize,
      align: "center",
    });

  // ── Firma ─────────────────────────────────────────────────
  const firmaX = margin + 60;
  const firmaY = pageHeight - margin - 50;

  doc
    .moveTo(firmaX, firmaY)
    .lineTo(firmaX + 160, firmaY)
    .lineWidth(1)
    .strokeColor("#555555")
    .stroke();

  doc
    .fontSize(10)
    .fillColor("#555555")
    .font("Helvetica")
    .text("Director/a", firmaX, firmaY + 5, { width: 160, align: "center" });

  doc.end();
}

module.exports = { generarDiplomaPDF };
