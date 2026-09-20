// entidades_data.js — Entidades Db2/DDS para diagrama ER interactivo SAMCO
const ENTIDADES = [
  {
    id:"ARTICLE", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/ARTICLE-Article_File.PF",
    nprogramas:8,
    descripcion:"Catálogo central de artículos/productos con precios, stock y familia.",
    campos:[
      {nombre:"ARID",tipo:"CHAR 6",pk:true},{nombre:"ARDESC",tipo:"CHAR 50"},{nombre:"ARSALEPR",tipo:"PACKED 7,2"},
      {nombre:"ARWHSPR",tipo:"PACKED 7,2"},{nombre:"ARTIFA",tipo:"CHAR 3",fk:"FAMILLY"},{nombre:"ARSTOCK",tipo:"PACKED 5,0"},
      {nombre:"ARMINQTY",tipo:"PACKED 5,0"},{nombre:"ARVATCD",tipo:"CHAR 1",fk:"VATDEF"},{nombre:"ARDEL",tipo:"CHAR 1"}
    ],
    relaciones:[
      {destino:"FAMILLY",campo_orig:"ARTIFA",campo_dest:"FAID",card:"N:1",confirmada:true},
      {destino:"ARTIPROV",campo_orig:"ARID",campo_dest:"APIART",card:"1:N",confirmada:true},
      {destino:"DETORD",campo_orig:"ARID",campo_dest:"ODARID",card:"1:N",confirmada:true}
    ]
  },
  {
    id:"CUSTOMER", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/CUSTOMER.PF",
    nprogramas:6,
    descripcion:"Maestro de clientes con datos de contacto, dirección y crédito.",
    campos:[
      {nombre:"CUID",tipo:"PACKED 5,0",pk:true},{nombre:"CUSTNM",tipo:"CHAR 30"},{nombre:"CUPHONE",tipo:"CHAR 15"},
      {nombre:"CUMAIL",tipo:"CHAR 50"},{nombre:"CUCOUN",tipo:"CHAR 2",fk:"COUNTRY"},{nombre:"CULIMCRE",tipo:"PACKED 9,2"},
      {nombre:"CUCREDIT",tipo:"PACKED 9,2"},{nombre:"CULASTORD",tipo:"PACKED 8,0"},{nombre:"CUDEL",tipo:"CHAR 1"}
    ],
    relaciones:[
      {destino:"COUNTRY",campo_orig:"CUCOUN",campo_dest:"COID",card:"N:1",confirmada:true},
      {destino:"ORDER",campo_orig:"CUID",campo_dest:"ORCUID",card:"1:N",confirmada:true}
    ]
  },
  {
    id:"ORDER", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/ORDER.PF",
    nprogramas:9,
    descripcion:"Cabecera de pedidos de venta con fechas y vinculación al cliente.",
    campos:[
      {nombre:"ORID",tipo:"PACKED 6,0",pk:true},{nombre:"ORYEAR",tipo:"PACKED 4,0"},{nombre:"ORCUID",tipo:"PACKED 5,0",fk:"CUSTOMER"},
      {nombre:"ORDATE",tipo:"PACKED 8,0"},{nombre:"ORDATDEL",tipo:"PACKED 8,0"},{nombre:"ORDATCLO",tipo:"PACKED 8,0"}
    ],
    relaciones:[
      {destino:"CUSTOMER",campo_orig:"ORCUID",campo_dest:"CUID",card:"N:1",confirmada:true},
      {destino:"DETORD",campo_orig:"ORID",campo_dest:"ODORID",card:"1:N",confirmada:true}
    ]
  },
  {
    id:"DETORD", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/DETORD.PF",
    nprogramas:5,
    descripcion:"Líneas de pedido: artículo, cantidad, precio e importes por línea.",
    campos:[
      {nombre:"ODORID",tipo:"PACKED 6,0",pk:true,fk:"ORDER"},{nombre:"ODYEAR",tipo:"PACKED 4,0",pk:true},
      {nombre:"ODLINE",tipo:"PACKED 5,0",pk:true},{nombre:"ODARID",tipo:"CHAR 6",fk:"ARTICLE"},
      {nombre:"ODQTY",tipo:"PACKED 5,0"},{nombre:"ODPRICE",tipo:"PACKED 7,2"},
      {nombre:"ODTOT",tipo:"PACKED 9,2"},{nombre:"ODTOTVAT",tipo:"PACKED 9,2"}
    ],
    relaciones:[
      {destino:"ORDER",campo_orig:"ODORID",campo_dest:"ORID",card:"N:1",confirmada:true},
      {destino:"ARTICLE",campo_orig:"ODARID",campo_dest:"ARID",card:"N:1",confirmada:true}
    ]
  },
  {
    id:"FAMILLY", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/FAMILLY.PF",
    nprogramas:4,
    descripcion:"Familias/categorías de artículos con código IVA por defecto.",
    campos:[
      {nombre:"FAID",tipo:"CHAR 3",pk:true},{nombre:"FADESC",tipo:"CHAR 50"},
      {nombre:"FAVATCD",tipo:"CHAR 1"},{nombre:"FADEL",tipo:"CHAR 1"}
    ],
    relaciones:[
      {destino:"ARTICLE",campo_orig:"FAID",campo_dest:"ARTIFA",card:"1:N",confirmada:true}
    ]
  },
  {
    id:"COUNTRY", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/COUNTRY.PF",
    nprogramas:4,
    descripcion:"Tabla de países con códigos ISO-3166.",
    campos:[
      {nombre:"COID",tipo:"CHAR 2",pk:true},{nombre:"COUNTR",tipo:"CHAR 30"},
      {nombre:"COISO",tipo:"CHAR 3"},{nombre:"COISO5",tipo:"CHAR 3"},{nombre:"COISO1",tipo:"CHAR 3"}
    ],
    relaciones:[
      {destino:"CUSTOMER",campo_orig:"COID",campo_dest:"CUCOUN",card:"1:N",confirmada:true},
      {destino:"PROVIDER",campo_orig:"COID",campo_dest:"PRCOUN",card:"1:N",confirmada:true}
    ]
  },
  {
    id:"PROVIDER", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/PROVIDER.PF",
    nprogramas:4,
    descripcion:"Maestro de proveedores con contacto, dirección y VAT.",
    campos:[
      {nombre:"PRID",tipo:"PACKED 5,0",pk:true},{nombre:"PROVNM",tipo:"CHAR 30"},
      {nombre:"PRCONT",tipo:"CHAR 30"},{nombre:"PRPHONE",tipo:"CHAR 15"},
      {nombre:"PRCOUN",tipo:"CHAR 2",fk:"COUNTRY"},{nombre:"PRDEL",tipo:"CHAR 1"}
    ],
    relaciones:[
      {destino:"COUNTRY",campo_orig:"PRCOUN",campo_dest:"COID",card:"N:1",confirmada:true},
      {destino:"ARTIPROV",campo_orig:"PRID",campo_dest:"APIPRO",card:"1:N",confirmada:true}
    ]
  },
  {
    id:"ARTIPROV", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/ARTIPROV.PF",
    nprogramas:3,
    descripcion:"Relación M:N entre artículos y proveedores con precio de compra.",
    campos:[
      {nombre:"APIART",tipo:"CHAR 6",pk:true,fk:"ARTICLE"},{nombre:"APIPRO",tipo:"PACKED 5,0",pk:true,fk:"PROVIDER"},
      {nombre:"APIPRI",tipo:"PACKED 7,2"}
    ],
    relaciones:[
      {destino:"ARTICLE",campo_orig:"APIART",campo_dest:"ARID",card:"N:1",confirmada:true},
      {destino:"PROVIDER",campo_orig:"APIPRO",campo_dest:"PRID",card:"N:1",confirmada:true}
    ]
  },
  {
    id:"PARAMETER", tipo:"PF", confirmada:true,
    fuente:"QDDSSRC/PARAMETER.PF",
    nprogramas:2,
    descripcion:"Parámetros de configuración de la aplicación (clave-valor).",
    campos:[
      {nombre:"PARKEY",tipo:"CHAR 20",pk:true},{nombre:"PARVAL",tipo:"CHAR 100"},
      {nombre:"PARDES",tipo:"CHAR 100"}
    ],
    relaciones:[]
  },
  // Vistas y Ficheros Lógicos significativos
  {
    id:"ORDERCUS", tipo:"VIEW", confirmada:true,
    fuente:"QSQLSRC/ORDERCUS.VIEW",
    nprogramas:2,
    descripcion:"Vista SQL: JOIN ORDER + CUSTOMER para informes consolidados de pedidos.",
    campos:[{nombre:"(ORDER.*)",tipo:"—"},{nombre:"(CUSTOMER.*)",tipo:"—"}],
    relaciones:[
      {destino:"ORDER",campo_orig:"—",campo_dest:"—",card:"N:1",confirmada:true},
      {destino:"CUSTOMER",campo_orig:"—",campo_dest:"—",card:"N:1",confirmada:true}
    ]
  },
  {
    id:"ARTIINF", tipo:"TABLE (DDL)", confirmada:true,
    fuente:"QSQLSRC/ARTIINF.TABLE",
    nprogramas:2,
    descripcion:"Tabla DDL adicional de información de artículo (complemento SQL a ARTICLE DDS).",
    campos:[{nombre:"(ver fuente)",tipo:"DDL"}],
    relaciones:[
      {destino:"ARTICLE",campo_orig:"ARID",campo_dest:"ARID",card:"1:1",confirmada:false}
    ]
  }
];
