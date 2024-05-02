const {Router} = require('express')
const router = Router()

const {createProxy, getAllProxy, deleteProxy, openSearchInnPartner, openSearchInnMy, getDataProxy, katalog} = require('../controllers/proxy.controller')

const {protect} =  require('../middlewares/auth')

router.post('/add',protect, createProxy)
router.get('/get',protect, getAllProxy)
router.delete('/delete/:id',protect, deleteProxy)
router.get('/search/inn/partner/:id', openSearchInnPartner)
router.get('/search/inn/i/:id', openSearchInnMy)
router.get('/search/date/', getDataProxy)
router.get("/katalog", katalog)

module.exports = router
