const db = require('../database');
const { asyncQuery } = require('../helpers/asyncQuery');

module.exports = ({
    getLotData: async (req, res) => {
        try {
            let sqlGet = 'SELECT parking_lot FROM parkinglot WHERE isAvailable = 1;'
            let getData = await asyncQuery(sqlGet)
            res.status(200).send(getData)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    register: (req, res) => {
        console.log('register req.body: ', req.body);
        let sqlGetLot = 'SELECT * FROM parkinglot WHERE isAvailable = 1 LIMIT 1;'

        db.query(sqlGetLot, (err1, results1) => {
            if (err1) res.status(500).send(err1)

            console.log('results1 register: ', results1[0])
            let sqlPost = `INSERT INTO datakendaraan VALUES 
                            (null, ${results1[0].id_parkinglot}, ${db.escape(req.body.plat_nomor)}, 
                            ${db.escape(req.body.warna)}, ${db.escape(req.body.tipe)})`;

            db.query(sqlPost, (err2, results2) => {
                if (err2) res.status(500).send(err2)
                console.log('results2 register:', results2)

                let sqlUpdate = `UPDATE parkinglot SET isAvailable = 0 WHERE id_parkinglot = ${results1[0].id_parkinglot};`
                db.query(sqlUpdate, (err3, results3) => {
                    if (err3) res.status(500).send(err3)
                    console.log('results3 register:', results3)

                    let sqlData = `INSERT INTO dataparking (id_dataparking, id_parkinglot, id_kendaraan) 
                                    VALUES (null, ${results1[0].id_parkinglot}, ${results2.insertId});`

                    db.query(sqlData, (err4, results4) => {
                        if (err4) res.status(500).send(err4)
                        console.log('results4 register:', results4)

                        let sqlGetDate = `SELECT tanggal_masuk FROM dataparking WHERE id_dataparking = ${results4.insertId};`
                        db.query(sqlGetDate, (err5, results5) => {
                            if (err5) res.status(500).send(err5)
                            console.log('results5 register:', results5)

                            res.status(200).send({ "plat_nomor": req.body.plat_nomor, "parking_lot": results1[0].parking_lot, "tanggal_masuk": results5[0].tanggal_masuk })
                        })
                    })
                })
            })
        })
    },
    checkout: (req, res) => {
        console.log('req.body checkout: ', req.body)

        let sqlGet = `SELECT * FROM dataparking dp JOIN datakendaraan dk ON dp.id_kendaraan = dk.id_kendaraan
                JOIN parkinglot pl ON dk.id_parkinglot = pl.id_parkinglot WHERE dk.plat_nomor = ${db.escape(req.body.plat_nomor)};`

        db.query(sqlGet, (err1, results1) => {
            if (err1) res.status(500).send('plat nomor tidak ditemukan')
            console.log('results1 checkout:', results1)

            let now = new Date()
            let lamaParkir = Math.ceil(((now.getTime() - results1[0].tanggal_masuk.getTime()) / (1000 * 60 * 60)))
            let biayaParkir = 0
            if (results1[0].tipe === 'SUV') {
                biayaParkir = 25000 + ((lamaParkir - 1) * 0.2 * 25000)
            } else if (results1[0].tipe === 'MPV') {
                biayaParkir = 35000 + ((lamaParkir - 1) * 0.2 * 35000)
            }

            console.log('biayaparkir: ', biayaParkir)
            console.log('getdate :', now.getTime())

            let sqlPost = `UPDATE dataparking SET tanggal_keluar = CURRENT_TIMESTAMP() , jumlah_bayar = ${biayaParkir} WHERE id_dataparking =${results1[0].id_dataparking};`

            db.query(sqlPost, (err2, results2) => {
                if (err2) res.status(500).send(err2)
                console.log('results2 checkout:', results2)

                let sqlUpdate = `UPDATE parkinglot SET isAvailable = 1 WHERE id_parkinglot = ${results1[0].id_parkinglot};`
                db.query(sqlUpdate, (err3, results3) => {
                    if (err3) res.status(500).send(err3)
                    console.log('results3 checkout:', results3)

                    let sqlData = `SELECT * FROM dataparking WHERE id_dataparking = ${results1[0].id_dataparking};`

                    db.query(sqlData, (err4, results4) => {
                        if (err4) res.status(500).send(err4)
                        console.log('results4 checkout:', results4)

                        res.status(200).send({
                            "plat_nomor": req.body.plat_nomor,
                            "tanggal_masuk": results1[0].tanggal_masuk,
                            "tanggal_keluar": results4[0].tanggal_keluar,
                            "jumlah_bayar": results4[0].jumlah_bayar
                        })
                    })
                })
            })
        })
    },
    tipeMobil: async (req, res) => {
        try {
            console.log('query tipeMobil: ', req.query.tipe)
            let sqlGet = `SELECT COUNT(*) AS jumlah_kendaraan FROM datakendaraan WHERE tipe="SUV";`
            let getData = await asyncQuery(sqlGet)

            // console.log(getData[0].jumlah_kendaraan)
            res.status(200).send(getData[0])
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }

    },
    nomorWarna: async (req, res) => {
        try {
            console.log('query nomorWarna: ', req.query.warna)
            let sqlGet = `SELECT plat_nomor FROM datakendaraan WHERE warna="Hitam";`
            let getData = await asyncQuery(sqlGet)

            console.log(getData)

            let plat_nomor = []
            getData.forEach(item => {
                plat_nomor.push(item.plat_nomor)
            })
            res.status(200).send({"plat_nomor": plat_nomor})

        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
})


