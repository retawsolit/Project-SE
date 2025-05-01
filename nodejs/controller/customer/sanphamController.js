const sanphamDB = require('../../model/customer/sanphamDB');
const headerDB = require('../../model/customer/headerDB');
const connection = require('../../connectDB');

const layout = './customer/layoutCustomer';

const formatVnd = (number) => {
    return String(number).replace(/(.)(?=(\d{3})+$)/g, '$1,');
};

let getLoaisanPham = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.getLoaiSanPham((data) => {
            res.render('customer/sanpham.ejs', {
                layout: layout,
                number_format: formatVnd,
                dataLsp: data,
                dataXx: false,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.params.idLsp);
    });
};

let getXuatxu = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.getXuatXu((data) => {
            res.render('customer/sanpham.ejs', {
                layout: layout,
                number_format: formatVnd,
                dataXx: data,
                dataLsp: false,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.params.idXx);
    });
};

let getDetail = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.getDetail((data) => {
            res.render('customer/detailSp.ejs', {
                layout: layout,
                number_format: formatVnd,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1],
                dataDetailSp: data[0],
                dataSameSp: data[1]
            });
            res.end();
        }, req.params.idSP, req.params.idLsp);
    });
};

let searchSanPham = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.searchSanPham((data) => {
            res.render('customer/search.ejs', {
                layout: layout,
                number_format: formatVnd,
                dataSp: data,
                title: req.body.search,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.body.search);
    });
};

let addToCart = (req, res) => {
    if (!req.cookies.dataLogin) {
        res.redirect('/customer/login');
        res.end();
    } else {
        sanphamDB.addToCart((data) => {
            res.redirect('/customer/san-pham/chi-tiet/' + req.body.idLsp + '/' + req.body.idSp);
            res.end();
        }, req.body, req.cookies.dataLogin.ID);
    }
};

let getCart = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.getCart((data) => {
            res.render('customer/cart.ejs', {
                layout: layout,
                number_format: formatVnd,
                dataCart: data,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.cookies.dataLogin.ID);
    });
};

let updateCart = (req, res) => {
    sanphamDB.updateCart((data) => {
        res.redirect('/customer/cart');
        res.end();
    }, req.cookies.dataLogin.ID, req.body);
};

let deleteCart = (req, res) => {
    sanphamDB.deleteCart((data) => {
        res.redirect('/customer/cart');
        res.end();
    }, req.body);
};

let orderCart = (req, res) => {
    try {
        const data = req.body;
        const idTk = req.cookies.dataLogin.ID;

        sanphamDB.orderCart((err, result) => {
            if (err) {
                console.error('Lỗi khi đặt hàng:', err);
                return res.status(500).send('Lỗi khi đặt hàng: ' + err.message);
            }

            const orderId = result.insertId;

            // Lấy tổng số tiền từ bảng hoadon
            const getTotalQuery = 'SELECT TongTien FROM hoadon WHERE ID = ?';
            connection.query(getTotalQuery, [orderId], (err, result) => {
                if (err) {
                    console.error('Lỗi khi lấy tổng tiền:', err);
                    return res.status(500).send('Lỗi server: Không lấy được tổng tiền');
                }

                const totalAmount = result[0]?.TongTien || 0;

                res.render('customer/payment.ejs', {
                    layout: false,
                    orderId: orderId,
                    totalAmount: totalAmount,
                    sessionID: req.cookies.dataLogin
                });
                res.end();
            });
        }, data, idTk);
    } catch (error) {
        console.error('Lỗi khi xử lý đặt hàng:', error);
        res.status(500).send('Lỗi server: ' + error.message);
    }
};

let getPayment = (req, res) => {
    if (!req.cookies.dataLogin) {
        res.redirect('/customer/login');
        res.end();
        return;
    }

    // Lấy đơn hàng gần nhất của người dùng
    const idTk = req.cookies.dataLogin.ID;
    const getLatestOrderQuery = 'SELECT ID, TongTien FROM hoadon WHERE IDTK = ? AND TrangThai = 1 ORDER BY NgayMua DESC LIMIT 1';
    connection.query(getLatestOrderQuery, [idTk], (err, result) => {
        if (err) {
            console.error('Lỗi khi lấy đơn hàng gần nhất:', err);
            return res.status(500).send('Lỗi server: Không lấy được đơn hàng');
        }

        if (!result[0]) {
            // Nếu không có đơn hàng nào, hiển thị dữ liệu giả lập
            const orderId = 0;
            const totalAmount = 0;

            res.render('customer/payment.ejs', {
                layout: false,
                orderId: orderId,
                totalAmount: totalAmount,
                sessionID: req.cookies.dataLogin
            });
            res.end();
        } else {
            // Nếu có đơn hàng, hiển thị thông tin thực tế
            const orderId = result[0].ID;
            const totalAmount = result[0].TongTien;

            res.render('customer/payment.ejs', {
                layout: false,
                orderId: orderId,
                totalAmount: totalAmount,
                sessionID: req.cookies.dataLogin
            });
            res.end();
        }
    });
};

let confirmPayment = (req, res) => {
    const orderId = req.params.orderId;

    sanphamDB.updateHoaDonStatus(orderId, 2, (err) => {
        if (err) {
            console.error('Lỗi khi cập nhật trạng thái hóa đơn:', err);
            return res.status(500).send('Lỗi khi xác nhận thanh toán: ' + err.message);
        }

        res.render('customer/payment-success.ejs', {
            layout: false,
            sessionID: req.cookies.dataLogin
        });
        res.end();
    });
};

let donHang = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.donHang((data) => {
            res.render('customer/donHangHienCo.ejs', {
                layout: layout,
                dataDonHang: data,
                number_format: formatVnd,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.cookies.dataLogin.ID);
    });
};

let chiTietDonHang = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.chiTietDonHang((data) => {
            res.render('customer/chiTietDonHang.ejs', {
                layout: layout,
                dataDonHang: data[0],
                dataChiTietDonHang: data[1],
                number_format: formatVnd,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.params.idDh);
    });
};

let lichSuDonHang = (req, res) => {
    headerDB.getHeader((headerData) => {
        if (!headerData) {
            console.error('Lỗi: Không lấy được header');
            return res.status(500).send('Lỗi server: Không lấy được dữ liệu header');
        }

        sanphamDB.lichSuDonHang((data) => {
            res.render('customer/lichSuDatHang.ejs', {
                layout: layout,
                dataDonHang: data,
                number_format: formatVnd,
                sessionID: req.cookies.dataLogin,
                dataHeaderSp: headerData[0],
                dataHeaderXx: headerData[1]
            });
            res.end();
        }, req.cookies.dataLogin.ID);
    });
};

let huyDonHang = (req, res) => {
    sanphamDB.huyDonHang(function (data) {
        res.redirect('/customer/don-hang');
        res.end();
    }, req.params.idDh);
};

module.exports = {
    getDetail,
    getLoaisanPham,
    getXuatxu,
    searchSanPham,
    addToCart,
    getCart,
    updateCart,
    deleteCart,
    orderCart,
    getPayment,
    confirmPayment,
    donHang,
    chiTietDonHang,
    lichSuDonHang,
    huyDonHang
};