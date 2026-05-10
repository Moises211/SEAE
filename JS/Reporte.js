// @ts-check

/**
 * @typedef {Object} DatosFinancieros
 * @property {number} I - Inversión Inicial
 * @property {number} S - Valor de Rescate
 * @property {number} R - Ingresos Anuales
 * @property {number} E - Egresos Anuales
 * @property {number} i - Tasa de Interés
 * @property {number} n - Periodos
 */

/**
 * @typedef {Object} ResultadoAlternativa
 * @property {string} nombre
 * @property {number} valor
 * @property {DatosFinancieros} datos
 * @property {number[]} flujos
 * @property {any} [tirData]
 */

export class Reporte {
    /**
     * @param {string} metodo
     * @param {ResultadoAlternativa[]} resultados
     * @param {ResultadoAlternativa} mejor
     * @param {string} [resumenComparativo]
     */
    constructor(metodo, resultados, mejor, resumenComparativo = "") {
        this.metodo = metodo;
        this.resultados = resultados;
        this.mejor = mejor;
        this.resumenComparativo = resumenComparativo;
    }

    /**
     * Genera y descarga el reporte en formato PDF.
     */
    generarReportePDF() {
        if (!Array.isArray(this.resultados) || this.resultados.length === 0) {
            alert("No hay resultados disponibles para generar el reporte.");
            return;
        }

        // @ts-ignore
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert("No se pudo cargar la librería jsPDF. Verifique la conexión a internet o el script en el HTML.");
            return;
        }

        // @ts-ignore
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        // @ts-ignore - Validación del plugin autoTable
        if (typeof doc.autoTable !== 'function') {
            alert("El plugin autoTable no se cargó correctamente. Asegúrese de incluir el script jspdf.plugin.autotable en el HTML.");
            return;
        }

        const colorPrimario = [81, 92, 122];
        const colorSecundario = [61, 69, 92];
        const colorTexto = [40, 40, 40];

        const anchoPagina = doc.internal.pageSize.getWidth();
        const margenIzq = 15;
        let posY = 20;

        doc.setFillColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.rect(0, 0, anchoPagina, 30, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Reporte de Evaluación Económica", anchoPagina / 2, 13, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("SEAE - Sistema de Evaluación de Alternativas Económicas", anchoPagina / 2, 21, { align: "center" });

        posY = 40;

        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Información General", margenIzq, posY);

        posY += 2;
        doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
        doc.setLineWidth(0.5);
        doc.line(margenIzq, posY, anchoPagina - margenIzq, posY);

        posY += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const fecha = new Date();
        const fechaStr = fecha.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        const horaStr = fecha.toLocaleTimeString("es-ES");

        doc.text(`Fecha de generación: ${fechaStr} - ${horaStr}`, margenIzq, posY);
        posY += 6;
        doc.text(`Método de evaluación: ${this._nombreCompletoMetodo(this.metodo)}`, margenIzq, posY);
        posY += 6;
        doc.text(`Cantidad de alternativas evaluadas: ${this.resultados.length}`, margenIzq, posY);
        posY += 12;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Resumen de Resultados", margenIzq, posY);
        posY += 2;
        doc.line(margenIzq, posY, anchoPagina - margenIzq, posY);
        posY += 7;

        const cabecerasResumen = [["Alternativa", "Inversión Inicial", "Periodos", `Resultado (${this.metodo})`]];
        const filasResumen = this.resultados.map(r => [
            r.nombre,
            `$${r.datos.I.toFixed(2)}`,
            r.datos.n.toString(),
            this._formatearValor(r.valor, this.metodo)
        ]);

        // @ts-ignore
        doc.autoTable({
            head: cabecerasResumen,
            body: filasResumen,
            startY: posY,
            margin: { left: margenIzq, right: margenIzq },
            theme: "grid",
            headStyles: { fillColor: colorPrimario, textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
            bodyStyles: { halign: "center", fontSize: 10 },
            alternateRowStyles: { fillColor: [240, 240, 245] }
        });

        // @ts-ignore
        posY = doc.lastAutoTable.finalY + 12;

        if (posY > 240) { doc.addPage(); posY = 20; }

        doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
        doc.roundedRect(margenIzq, posY, anchoPagina - 2 * margenIzq, 18, 3, 3, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("MEJOR ALTERNATIVA", margenIzq + 5, posY + 7);

        doc.setFontSize(13);
        doc.text(`${this.mejor.nombre}  -  ${this._formatearValor(this.mejor.valor, this.metodo)}`, margenIzq + 5, posY + 14);

        posY += 25;

        // Insertar Resumen Comparativo Detallado si existe
        if (this.resumenComparativo) {
            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            const lineasTexto = doc.splitTextToSize(this.resumenComparativo, anchoPagina - (2 * margenIzq));
            doc.text(lineasTexto, margenIzq, posY);
            posY += (lineasTexto.length * 5) + 10;
        }

        doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);

        this.resultados.forEach((res, idx) => {
            if (posY > 220) { doc.addPage(); posY = 20; }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.text(`${idx + 1}. ${res.nombre}`, margenIzq, posY);

            posY += 2;
            doc.setDrawColor(colorPrimario[0], colorPrimario[1], colorPrimario[2]);
            doc.line(margenIzq, posY, anchoPagina - margenIzq, posY);
            posY += 7;

            const datosEntrada = [
                ["Inversión Inicial (I)", `$${res.datos.I.toFixed(2)}`],
                ["Valor de Rescate (S)", `$${res.datos.S.toFixed(2)}`],
                ["Tasa de Interés (i)", `${(res.datos.i * 100).toFixed(2)}%`],
                ["Periodos (n)", res.datos.n.toString()]
            ];

            if (this.metodo === "CAE") {
                datosEntrada.push(
                    ["Ingresos Anuales (R)", `$${res.datos.R.toFixed(2)}`],
                    ["Egresos Anuales (E)", `$${res.datos.E.toFixed(2)}`]
                );
            }

            datosEntrada.push([`Resultado ${this.metodo}`, this._formatearValor(res.valor, this.metodo)]);

            // @ts-ignore
            doc.autoTable({
                body: datosEntrada,
                startY: posY,
                margin: { left: margenIzq, right: margenIzq },
                theme: "striped",
                styles: { fontSize: 9 },
                columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 }, 1: { halign: "right" } }
            });

            // @ts-ignore
            posY = doc.lastAutoTable.finalY + 6;

            // Insertar Gráfico de Evolución
            const canvasEvol = /** @type {HTMLCanvasElement} */ (document.getElementById(`chartEvol-${idx}`));
            if (canvasEvol) {
                if (posY > 200) { doc.addPage(); posY = 20; }
                const imgData = canvasEvol.toDataURL("image/png");
                // @ts-ignore
                const imgProps = doc.getImageProperties(imgData);
                const imgW = 140; // Ancho en mm
                const imgH = (imgProps.height * imgW) / imgProps.width;
                
                doc.addImage(imgData, 'PNG', (anchoPagina - imgW) / 2, posY, imgW, imgH);
                posY += imgH + 10;
            }

            if ((this.metodo === "VPN" || this.metodo === "TIR") && res.flujos && res.flujos.length > 0) {
                if (posY > 230) { doc.addPage(); posY = 20; }
                doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text("Flujos de Caja por Periodo:", margenIzq, posY);
                posY += 4;
                const cabecerasFlujos = [["Periodo", "Monto ($)"]];
                const filasFlujos = res.flujos.map((f, i) => [(i + 1).toString(), `$${f.toFixed(2)}`]);

                // @ts-ignore
                doc.autoTable({
                    head: cabecerasFlujos,
                    body: filasFlujos,
                    startY: posY,
                    margin: { left: margenIzq, right: margenIzq },
                    theme: "grid",
                    headStyles: { fillColor: colorSecundario, textColor: [255, 255, 255], halign: "center" },
                    bodyStyles: { halign: "center", fontSize: 9 },
                    tableWidth: 80
                });
                // @ts-ignore
                posY = doc.lastAutoTable.finalY + 6;
            }

            if (this.metodo === "TIR" && res.tirData) {
                if (posY > 250) { doc.addPage(); posY = 20; }
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text("Detalle del cálculo de TIR:", margenIzq, posY);
                posY += 5;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                const aceptable = res.tirData.aceptable ? "Aceptable (TIR >= TMA)" : "No Aceptable (TIR < TMA)";
                doc.text(`- Tasa Interna de Rendimiento: ${(res.tirData.tasaIRR * 100).toFixed(4)}%`, margenIzq + 3, posY);
                posY += 5;
                doc.text(`- Tasa Minima Aceptable (TMA): ${(res.datos.i * 100).toFixed(2)}%`, margenIzq + 3, posY);
                posY += 5;
                doc.text(`- Conclusion: ${aceptable}`, margenIzq + 3, posY);
                posY += 8;
            }

            // Insertar Gráfico de TIR (Interpolación)
            const canvasTIR = /** @type {HTMLCanvasElement} */ (document.getElementById(`chartTIR-${idx}`));
            if (this.metodo === "TIR" && canvasTIR) {
                if (posY > 200) { doc.addPage(); posY = 20; }
                const imgDataTIR = canvasTIR.toDataURL("image/png");
                // @ts-ignore
                const imgPropsTIR = doc.getImageProperties(imgDataTIR);
                const imgW = 140;
                const imgH = (imgPropsTIR.height * imgW) / imgPropsTIR.width;

                doc.addImage(imgDataTIR, 'PNG', (anchoPagina - imgW) / 2, posY, imgW, imgH);
                posY += imgH + 10;
            }

            posY += 4;
        });

        const totalPaginas = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPaginas; p++) {
            doc.setPage(p);
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(`SEAE - Reporte generado el ${fechaStr}`, margenIzq, doc.internal.pageSize.getHeight() - 8);
            doc.text(`Pagina ${p} de ${totalPaginas}`, anchoPagina - margenIzq, doc.internal.pageSize.getHeight() - 8, { align: "right" });
        }

        doc.save(`SEAE_Reporte_${this.metodo}_${fecha.getTime()}.pdf`);
    }

    /**
     * @private
     * @param {string} metodo
     */
    _nombreCompletoMetodo(metodo) {
        switch (metodo) {
            case "CAE": return "Costo Anual Equivalente (CAE/VA)";
            case "VPN": return "Valor Presente Neto (VPN)";
            case "TIR": return "Tasa Interna de Rendimiento (TIR)";
            default: return metodo;
        }
    }

    /**
     * @private
     * @param {number} valor
     * @param {string} metodo
     */
    _formatearValor(valor, metodo) {
        if (metodo === "TIR") {
            return valor <= 0.01 ? "No determinable" : `${valor.toFixed(2)}%`;
        }
        return `$${valor.toFixed(2)}`;
    }
}
