//Dataset Global JSON
var GeneralDS;
var optionDS;
var observationDS;
var auxDS;

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
            GeneralDS = json;

        })
        .catch(function () {
            this.dataError = true;
        })

}

const groupBy = (array, key) => {

    return array.reduce((result, currentValue) => {
        // Si ya existe el arreglo para la llave lo pushea.Si no se crea el nuevo arreglo y se pushea
        (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
        );

        return result;
    }, {});
};

function genObservationDS(general) {
    var arrayDS = [];

    Object.keys(general['AÑO']).forEach(index => {
        var aux = new Object();
        Object.keys(general).forEach(key => {
            aux[key] = general[key][index]
        })
        arrayDS.push(aux);
    })

    return arrayDS;
}

function genOptionDataset(DS) {
    var dataset = {
        estados: []
    };

    const estados_agrupados = groupBy(DS, 'ESTADO');

    Object.keys(estados_agrupados).sort().forEach(key => {
        const muni_agrupados = groupBy(estados_agrupados[key], 'MUNICIPIO');
        var estado = {
            nombre: key,
            municipios: Object.keys(muni_agrupados)
        }

        estado.municipios = estado.municipios.map(function (muni) {
            const sost_agrupadas = groupBy(muni_agrupados[muni], 'SOSTENIMIENTO');
            var sostenimiento_aux = Object.keys(sost_agrupadas);

            sostenimiento_aux = sostenimiento_aux.map(function (sost) {
                const nivel_agrupadas = groupBy(sost_agrupadas[sost], 'NIVEL');
                var nivel_aux = Object.keys(nivel_agrupadas);


                nivel_aux = nivel_aux.map(function (nivel) {
                    const inst_agrupadas = groupBy(nivel_agrupadas[nivel], 'INSTITUCION');
                    var inst_aux = Object.keys(inst_agrupadas);

                    inst_aux = inst_aux.map(function (inst) {
                        const carrera_agrupadas = groupBy(inst_agrupadas[inst], 'CARRERA');
                        var carrera_aux = Object.keys(carrera_agrupadas);

                        carrera_aux = carrera_aux.map(function (carrera) {
                            return { nombre: carrera };
                        })

                        return { nombre: inst, carreras: carrera_aux };
                    })

                    return { nombre: nivel, instituciones: inst_aux };
                })

                return { nombre: sost, niveles: nivel_aux };
            })

            return { nombre: muni, sostenimiento: sostenimiento_aux };
        });

        dataset.estados.push(estado);
    });
    return dataset;
}


function transformDataToOptions(arrayData, string) {
    x = {
        nombre: string,
    };

    arrayData.unshift(x);

    return arrayData.map(x => {
        const optionEl = document.createElement('option');
        optionEl.textContent = x.nombre;
        optionEl.value = x.nombre;
        return optionEl;
    })

}

function transformInstToOptions(arrayData, string) {

    arrayData.unshift(string);

    return arrayData.map(x => {
        const optionEl = document.createElement('option');
        optionEl.textContent = x;
        optionEl.value = x;
        return optionEl;
    })
}

function actualizarOpciones(opciones, listaEl) {

    opciones.forEach(opcion => {
        listaEl.append(opcion);

    });
    listaEl.selectedIndex = 0;

}

function findOptions(selectedOption, data){
    
    auxDS = data.find(option => option.nombre === selectedOption);
    var organizedData = [];
    auxDS.municipios.forEach(muni =>{
        organizedData.push({id:muni.nombre, nombre:muni.nombre})
    })
    return organizedData;
}


function main() {
    document.addEventListener("DOMContentLoaded", function () {
        var chartDom = document.getElementById('main');

        (async () => {

            await readJson('./data/SIME_Final.json');
            observationDS = genObservationDS(GeneralDS);
            optionDS = genOptionDataset(observationDS);
            console.log(optionDS);




            const opcionesAnio = transformInstToOptions(Object.keys(groupBy(observationDS, 'AÑO')), "<Todos los años>");
            const listaAnioEl = document.getElementById('anio');



            const opcionesEstados = transformDataToOptions(optionDS.estados, "<Seleccione Estado>");
            const listaEstadosEl = document.getElementById('estado');



            const opcionesOrigen = transformInstToOptions(Object.keys(groupBy(observationDS, 'ESTADO ORIGEN')), "<Todos los Origenes>");
            const listaOrigenEl = document.getElementById('origen');


            actualizarOpciones(opcionesAnio, listaAnioEl);
            actualizarOpciones(opcionesEstados, listaEstadosEl);
            actualizarOpciones(opcionesOrigen, listaOrigenEl);

            var estados = new IconicMultiSelect({
                select: "#estado",
            })
            estados.init();


            var origens = new IconicMultiSelect({
                select: "#origen",
            })
            origens.init();

            var anios = new IconicMultiSelect({
                select: "#anio",
            })
            anios.init();

            var municipios= new IconicMultiSelect({
                select: "#municipio"
            });

            

            estados.subscribe(function(event){
                municipios = new IconicMultiSelect({
                    data : findOptions(event.value, optionDS.estados),
                    textField: "nombre",
                    valueField: "id",
                    select: "#municipio"
                })
                municipios.init();
            municipios.subscribe(function(event){
                //// Subscribe: Es el Listener - Init: Inicia el js, verificar como cambiar data sin 
                //// Crear un iconicmultiselect nuevo para que se no se vaya poniendo encima del anterior
            })
                
                
            })
            

        })();
    })

}

main();