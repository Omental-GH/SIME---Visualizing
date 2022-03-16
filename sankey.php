<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="/css/test.css">
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.3.0/dist/echarts.min.js"></script>
    <script src="./js/sankey.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
    </style>

</head>

<body>

    <form>
        <label for="estadoe">Estado:</label>
        <select id="estado" name="estado"></select>
        <br>
        <label for="municipio">Municipio:</label>
        <select id="municipio" name="municipio"></select>
        <br>
        <label for="institucion">Institucion:</label>
        <select id="institucion" name="institucion"></select>
        <br>
        <label for="anio">Año:</label>
        <select id="anio" name="anio"></select>
        <br>
        <label for="origen">Estado Origen:</label>
        <select id="origen" name="origen"></select>
    </form>
    <br>
    <br>
    <div class="container_test">
        <div id="main" style="width: 1000px;height:1000px;"></div>
    </div>





</body>

</html>