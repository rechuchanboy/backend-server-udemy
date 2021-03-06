var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valida',
            errors: { message: 'Tipo de coleccion no valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono archivos',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obteber nombre del archivo
    var archivo = req.files.imagen;
    var arrArchivo = archivo.name.split('.');
    var extensionArchivo = arrArchivo[arrArchivo.length - 1];

    // Extrensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {

        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    //  Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo del temporal a un path 
    var path = `uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {

                eliminarArchivo('./uploads/usuarios/' + nombreArchivo);

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                eliminarArchivo(pathViejo);
            }
            // if (fs.existsSync(pathViejo)) {
            //     fs.unlink(pathViejo, (err) => {
            //         if (err) {
            //             return res.status(500).json({
            //                 ok: false,
            //                 mensaje: 'Error al eliminar archivo',
            //                 errors: { message: 'Error al eliminar archivo', err }
            //             });
            //         }
            //     });
            // }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {

                eliminarArchivo('./uploads/medicos/' + nombreArchivo);

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                eliminarArchivo(pathViejo);
            }
            // if (fs.existsSync(pathViejo)) {
            //     fs.unlink(pathViejo, (err) => {
            //         if (err) {
            //             return res.status(500).json({
            //                 ok: false,
            //                 mensaje: 'Error al eliminar archivo',
            //                 errors: { message: 'Error al eliminar archivo', err }
            //             });
            //         }
            //     });
            // }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });

        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {

                eliminarArchivo('./uploads/hospitales/' + nombreArchivo);

                return res.status(400).json({
                    ok: false,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                eliminarArchivo(pathViejo);
            }
            // if (fs.existsSync(pathViejo)) {
            //     // fs.unlinkSync(pathViejo);

            //     fs.unlink(pathViejo, (err) => {
            //         if (err) {
            //             return res.status(500).json({
            //                 ok: false,
            //                 mensaje: 'Error al eliminar archivo',
            //                 errors: { message: 'Error al eliminar archivo', err }
            //             });
            //         }
            //     });
            // }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

function eliminarArchivo(pathViejo) {

    // Si existe, elimina la imagen anterior
    if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al eliminar archivo',
                    errors: { message: 'Error al eliminar archivo', err }
                });
            }
        });
    }
}

module.exports = app;