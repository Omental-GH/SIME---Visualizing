//Dataset Global en JSON
var optionDataSet;
var observationDataset;

//LECTURA Y ASIGNACION DE JSON
async function readJson(path) {
  var datos = await fetch(path)
    .then(response => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then(json => {
      this.users = json;
      var data = this.users.data;
      observationDataset = data;
      optionDataSet = genDataset(data);
    })
    .catch(function () {
      this.dataError = true;
    })

}

//GENERACION DE DATASET EN FORMATO DESEADO PARA OptionBox
function genDataset(DS) {
  var dataset = {
    estados: []
  };

  const estados_agrupados = groupBy(DS, 'ESTADO');

  Object.keys(estados_agrupados).forEach(key => {
    const muni_agrupados = groupBy(estados_agrupados[key], 'MUNICIPIO');
    var estado = {
      nombre: key,
      municipios: Object.keys(muni_agrupados)
    }
    estado.municipios = estado.municipios.map(function (muni) {
      const inst_agrupadas = groupBy(muni_agrupados[muni], 'INSTITUCION')
      return { nombre: muni, instituciones: Object.keys(inst_agrupadas) };
    });
    dataset.estados.push(estado);
  });
  return dataset;
}

//Limpieza de opciones en SelectBox
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

//AGRUPACIONES PARA JSON
const groupBy = (array, key) => {

  return array.reduce((result, currentValue) => {
    // Si ya existe el arreglo para la llave lo pushea.Si no se crea el nuevo arreglo y se pushea
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );

    return result;
  }, {});
};


function transformDataToOptions(Array, string) {
  x = {
    nombre: string,
  };
  Array.push(x);

  return Array.map(x => {
      const optionEl = document.createElement('option');
      optionEl.textContent = x.nombre;
      optionEl.value = x.nombre;
      return optionEl;    
  })
}
function transformInstToOptions(Array, string) {
  
  Array.push(string);

  return Array.map(x => {
    const optionEl = document.createElement('option');
    optionEl.textContent = x;
    optionEl.value = x;
    return optionEl;
  })
}

function actualizarSelect(selectedState, parentDataset, listaMuniEl, listaInstEl) {

  var x = parentDataset.find(est => est.nombre === selectedState);

  if (listaMuniEl.childElementCount > 0)
    removeAllChildNodes(listaMuniEl);

  const opciones = transformDataToOptions(x.municipios);
  opciones.forEach(muni => {
    listaMuniEl.append(muni);
  });

  listaMuniEl.addEventListener('input', function () {
    var y = x.municipios.find(muni => muni.nombre === listaMuniEl.value);

    if (listaInstEl.childElementCount > 0)
      removeAllChildNodes(listaInstEl);

    const inst_opciones = transformInstToOptions(y.instituciones);
    inst_opciones.forEach(inst => {
      listaInstEl.append(inst);
    });

  });


}


// REALIZAR FUNCION PARA CAMBIAR EL SELECT DE LOS ORIGENES PARA QUE CAMBIE
// DEPENDIENDO DE LAS OBSERVACIONES QUE TENEMOS

//TAMBIEN 
//PONERLE LOS TEXTOS DE DEFAULT A LOS SELECTS PARA QUE SE PUEDAN GENERAR 
//BIEN LOS SANKEYS CUANDO SE NECESITEN MOSTRAR TODOS LAS INSTITUCIONES Y AÑOS
//HACER FUNCION PARA QUE AL SELECCIONAR EL AÑO SE CAMBIE EL DATASET DE LAS 
//OBSERVACIONES PARA GRAFICAR
function actualizarOrigenes(){



}




function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function doSankey(conections, myChart, institucion) {
  var option;
  option = {
    backgroundColor: '#FFFFFF',
    series: [
      {
        type: 'sankey',
        left: 50.0,
        top: 20.0,
        right: 100.0,
        bottom: 25.0,
        nodeAlign: 'right',
        emphasis: {
          focus: 'adjacency'
        },
        data: genNodes(conections, institucion),
        links: genConections(conections),
        lineStyle: {
          color: 'source',
          curveness: 0.5
        },
        itemStyle: {
          color: '#1f77b4',
          borderColor: '#1f77b4'
        },
        label: {
          color: 'rgba(0,0,0,0.7)',
          fontFamily: 'Anton',
          fontSize: 10,
          
          
        }
      }
    ],
    tooltip: {
      trigger: 'item'
    }
  };

  option && myChart.setOption(option);
}

function genConections(conections_data) {
  var conections = [];

  conections_data.forEach(obs => {
    var new_conection = {
      source: obs.ESTADO_ORIGEN,
      target: obs.INSTITUCION,
      value: parseInt(obs.MATRICULA_FORANEA)
    }
    conections.push(new_conection);
  });

  return conections;
}






function genNodes(observations_data, inst) {
  var nodes_data = [];
  var aux = [];
  var institucion = inst;


  observations_data.forEach(observation => {

    aux.push(observation.ESTADO_ORIGEN);
  });

  aux = new Set(aux);

  aux.forEach(a => {
    var eachColor = getRandomColor()
    var estado_origen = {
      name: a,
      itemStyle: {
        color: eachColor,
        borderColor: eachColor
      }
    }
    nodes_data.push(estado_origen);
  })


  var color_aux = getRandomColor();
  var institucion_aux = {
    name: institucion,
    color: color_aux,
    borderColor: color_aux
  }
  nodes_data.push(institucion_aux);

  return nodes_data;
}




function actualizarSankey(estado, municipio, institucion, myChart) {
  var prime = groupBy(observationDataset, 'ESTADO');
  var secun = groupBy(prime[estado], 'MUNICIPIO');
  var third = groupBy(secun[municipio], 'INSTITUCION');

  doSankey(third[institucion], myChart, institucion);

}

function actualizarOpciones(opciones, listaEl){

  opciones.forEach(opcion => {
    listaEl.append(opcion);

  });
  listaEl.selectedIndex = opciones.length-1;
}

function main() {


  //Agregas un escuchador para que cuando se termine de cargar la pagina HTML se realice el JS
  document.addEventListener("DOMContentLoaded", function () {

    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);


    (async () => {

      await readJson('./data/sankey_data.json');

      const opcionesEstados = transformDataToOptions(optionDataSet.estados,"<Seleccione Estado>");
      const listaEstadosEl = document.getElementById('estado');
      const listaMuniEl = document.getElementById('municipio');
      const listaInstEl = document.getElementById('institucion');

      const opcionesAnio = transformInstToOptions(Object.keys(groupBy(observationDataset, 'AÑO')),"<Todos los años>");
      const listaAnioEl = document.getElementById('anio');

      const opcionesOrigen = transformInstToOptions(Object.keys(groupBy(observationDataset, 'ESTADO_ORIGEN')),"<Todos los Origenes>");
      const listaOrigenEl = document.getElementById('origen');


      actualizarOpciones(opcionesEstados,listaEstadosEl);

      actualizarOpciones(opcionesAnio,listaAnioEl);

      actualizarOpciones(opcionesOrigen,listaOrigenEl);

      listaEstadosEl.addEventListener('input', function () {
        actualizarSelect(listaEstadosEl.value, optionDataSet.estados, listaMuniEl, listaInstEl)
      });

      listaInstEl.addEventListener('input', function () {
        actualizarSankey(listaEstadosEl.value, listaMuniEl.value, listaInstEl.value, myChart);
      });



    })();








  })
}




main();