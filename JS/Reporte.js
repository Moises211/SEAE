
function GenerarReportePDF(metodo, resultados, mejor) {


    if (!Array.isArray(resultados) || resultados.length === 0) {
        alert("No hay resultados disponibles para generar el reporte.");
        return;
    }

    
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        alert("No se pudo cargar la librería jsPDF. Verifique la conexión a internet o el script en el HTML.");
        return;
    }


    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });


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
    doc.text(`Método de evaluación: ${nombreCompletoMetodo(metodo)}`, margenIzq, posY);
    posY += 6;
    doc.text(`Cantidad de alternativas evaluadas: ${resultados.length}`, margenIzq, posY);
    posY += 12;


    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen de Resultados", margenIzq, posY);
    posY += 2;
    doc.line(margenIzq, posY, anchoPagina - margenIzq, posY);
    posY += 7;


    const cabecerasResumen = [["Alternativa", "Inversión Inicial", "Periodos", `Resultado (${metodo})`]];
    const filasResumen = resultados.map(r => [
        r.nombre,
        `$${r.datos.I.toFixed(2)}`,
        r.datos.n.toString(),
        formatearValor(r.valor, metodo)
    ]);


    doc.autoTable({
        head: cabecerasResumen,
        body: filasResumen,
        startY: posY,
        margin: { left: margenIzq, right: margenIzq },
        theme: "grid",
        headStyles: {
            fillColor: colorPrimario,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center"
        },
        bodyStyles: {
            halign: "center",
            fontSize: 10
        },
        alternateRowStyles: {
            fillColor: [240, 240, 245]
        }
    });


    posY = doc.lastAutoTable.finalY + 12;


    if (posY > 240) { doc.addPage(); posY = 20; }

    doc.setFillColor(colorSecundario[0], colorSecundario[1], colorSecundario[2]);
    doc.roundedRect(margenIzq, posY, anchoPagina - 2 * margenIzq, 18, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MEJOR ALTERNATIVA", margenIzq + 5, posY + 7);

    doc.setFontSize(13);
    doc.text(
        `${mejor.nombre}  -  ${formatearValor(mejor.valor, metodo)}`,
        margenIzq + 5,
        posY + 14
    );

    posY += 25;
    doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);


    resultados.forEach((res, idx) => {

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


        if (metodo === "CAE") {
            datosEntrada.push(
                ["Ingresos Anuales (R)", `$${res.datos.R.toFixed(2)}`],
                ["Egresos Anuales (E)", `$${res.datos.E.toFixed(2)}`]
            );
        }

        datosEntrada.push([
            `Resultado ${metodo}`,
            formatearValor(res.valor, metodo)
        ]);


        doc.autoTable({
            body: datosEntrada,
            startY: posY,
            margin: { left: margenIzq, right: margenIzq },
            theme: "striped",
            styles: { fontSize: 9 },
            columnStyles: {
                0: { fontStyle: "bold", cellWidth: 70 },
                1: { halign: "right" }
            }
        });


        posY = doc.lastAutoTable.finalY + 6;

       
        if ((metodo === "VPN" || metodo === "TIR") && res.flujos && res.flujos.length > 0) {
            if (posY > 230) { doc.addPage(); posY = 20; }

            doc.setTextColor(colorTexto[0], colorTexto[1], colorTexto[2]);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Flujos de Caja por Periodo:", margenIzq, posY);
            posY += 4;

            const cabecerasFlujos = [["Periodo", "Monto ($)"]];
            const filasFlujos = res.flujos.map((f, i) => [
                (i + 1).toString(),
                `$${f.toFixed(2)}`
            ]);

  
            doc.autoTable({
                head: cabecerasFlujos,
                body: filasFlujos,
                startY: posY,
                margin: { left: margenIzq, right: margenIzq },
                theme: "grid",
                headStyles: {
                    fillColor: colorSecundario,
                    textColor: [255, 255, 255],
                    halign: "center"
                },
                bodyStyles: { halign: "center", fontSize: 9 },
                tableWidth: 80
            });


            posY = doc.lastAutoTable.finalY + 6;
        }


        if (metodo === "TIR" && res.tirData) {
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

        posY += 4;
    });


    const totalPaginas = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPaginas; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
            `SEAE - Reporte generado el ${fechaStr}`,
            margenIzq,
            doc.internal.pageSize.getHeight() - 8
        );
        doc.text(
            `Pagina ${p} de ${totalPaginas}`,
            anchoPagina - margenIzq,
            doc.internal.pageSize.getHeight() - 8,
            { align: "right" }
        );
    }

    // ===== GUARDAR EL ARCHIVO =====
    const nombreArchivo = `SEAE_Reporte_${metodo}_${fecha.getTime()}.pdf`;
    doc.save(nombreArchivo);
}


function nombreCompletoMetodo(metodo) {
    switch (metodo) {
        case "CAE": return "Costo Anual Equivalente (CAE/VA)";
        case "VPN": return "Valor Presente Neto (VPN)";
        case "TIR": return "Tasa Interna de Rendimiento (TIR)";
        default: return metodo;
    }
}


function formatearValor(valor, metodo) {
    if (metodo === "TIR") {
        return valor <= 0.01
            ? "No determinable"
            : `${valor.toFixed(2)}%`;
    }
    return `$${valor.toFixed(2)}`;
}

export { GenerarReportePDF };
