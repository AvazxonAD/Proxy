const Proxy = require('../models/proxy.models')
const Enterprise = require('../models/enterprise.models')
const asyncHandler = require('../middlewares/async')
const ErrorResponse = require('../utils/error.response')

// add new proxy 
exports.createProxy = asyncHandler(async (req, res, next) => {
    const {
        proxyNumber,
        dateHead,
        dateEnd,
        agreementNumber ,
        dateAgreement ,
        myEnterpriseInn ,
        hisEnterpriseInn ,
        myEnterpriseName ,
        myAccountNumber ,
        mySWFT,
        myAddress ,
        myBoss ,
        hisEnterpriseName ,
        hisAccountNumber ,
        hisSWFT,
        hisAddress ,
        hisBoss ,
        ReliableJSHR ,
        ReliableFIO ,
        ReliablePosition,
        ReliablePassport,
        GivenByWhom,
        givenDate,
        goods,
        myAccountant,
        hisAccountant
    } = req.body
    // malumotlar bosh emasligiga ishonch hosil qilish 
    if (!proxyNumber || 
        !dateHead || 
        !dateEnd || 
        !agreementNumber  || 
        !dateAgreement  || 
        !myEnterpriseInn  || 
        !hisEnterpriseInn  || 
        !myEnterpriseName  || 
        !myAccountNumber  || 
        !mySWFT  || 
        !myAddress  || 
        !myBoss  || 
        !hisEnterpriseName  || 
        !hisAccountNumber  || 
        !hisSWFT  || 
        !hisAddress  || 
        !hisBoss  || 
        !ReliableJSHR  || 
        !ReliableFIO  || 
        !ReliablePosition || 
        !ReliablePassport || 
        !GivenByWhom || 
        !givenDate || 
        !goods,
        !myAccountant,
        !hisAccountant
    ){
        return next(new ErrorResponse('Barcha sorovlar toldirilishi shart', 400));
    }    
    if(!req.user){
        return next(new ErrorResponse('Royhatdan otmagan', 403))
    }
    if(parseInt(myEnterpriseInn) !== req.user.inn){
        return next(new ErrorResponse('O\'zinggizning korxonanggiz inn raqami notogri kiritildi'))
    }
    if(myEnterpriseName.trim() !== req.user.name){
        return next(new ErrorResponse('O\'zinggizning korxonanggiz nomini notog\'ri kiritdinggiz'))
    }
    if(ReliableJSHR.toString().length !== 14){
        return next(new ErrorResponse('Ishonchli odam JSHRi 14 ta raqamdan iborat bolishi zarur'))
    }
    if(hisEnterpriseInn.toString().length !== 9){
        return next(new ErrorResponse('Hamkor korxona inn raqami 9 ta raqamdan iborat bolishi zarur'))
    }
    // malumotni database ga yukalash
    const proxy = await Proxy.create({
        proxyNumber,
        dateHead,
        dateEnd,
        agreementNumber ,
        dateAgreement ,
        myEnterpriseInn ,
        hisEnterpriseInn ,
        myEnterpriseName ,
        myAccountNumber ,
        mySWFT ,
        myAddress ,
        myBoss ,
        hisEnterpriseName ,
        hisAccountNumber ,
        hisSWFT,
        hisAddress ,
        hisBoss ,
        ReliableJSHR ,
        ReliableFIO ,
        ReliablePosition,
        ReliablePassport,
        GivenByWhom,
        givenDate,
        goods,
        myAccountant,
        hisAccountant,
        enterpriseId : req.user._id
    })

    await Enterprise.findOneAndUpdate({name : req.user.name}, 
        {$push : {proxy : proxy._id}},
        {new : true, upsert : true}
    )
    
    res.status(200).json({
        success : true,
        proxy
    })
})
// get all proxy 
exports.getAllProxy = asyncHandler(async (req, res, next) => {
    //pagination
    const pageLimit = process.env.PAGE_LIMIT || 2
    const limit = parseInt(req.query.limit || pageLimit)
    const page = parseInt(req.query.page) || 1
    
    if(!req.user){
        return next(new ErrorResponse('Unregistered user'))
    }
    const proxy = await Proxy
        .find({enterpriseId : req.user._id})
        .skip((page * limit) - limit)
        .limit(limit)

    // pagination count
    const proxyLength = await Proxy.find({enterpriseId : req.user._id})
    
    const total = proxyLength.length
    res.status(200).json({
        success : true,
        pageCount: Math.ceil(total/limit),
        currentPage: page,
        nextPage: Math.ceil(total/limit) < page + 1 ? null : page + 1,
        data : proxy.reverse()
    })
})
// delete proxy 
exports.deleteProxy  = asyncHandler(async (req, res, next) => {
    if(!req.user){
        return next(new ErrorResponse('Unregistered user'))
    }
    const enterprise = await Enterprise.findById(req.user._id)
    const deletedProxy = await Proxy.findByIdAndDelete(req.params.id);
    if (!deletedProxy) {
        return next(new ErrorResponse('Proxy not found'));
    }
    res.status(200).json({
        success : true,
        data : "Delete proxy"
    })
})

// inn orqali oldin kiritlgan proxyni topish 
// proxyni kirgazayotganda qulaylik bolishi uchun 
// hamkor enterpriseni qidirish 
exports.openSearchInnPartner = asyncHandler(async (req, res, next) => {
    const partner = await Proxy.findOne({hisEnterpriseInn : parseInt(req.params.id)})
    const hisEnterprise = {}
    if(!partner){
        return res.status(404).json({
            success : false,
            message : "Bu inn raqamli korxona topilmadi"
        })
    }
    hisEnterprise.hisEnterpriseName = partner.hisEnterpriseName
    hisEnterprise.hisAccountNumber = partner.hisAccountNumber
    hisEnterprise.hisSWFT = partner.hisSWFT
    hisEnterprise.hisAddress = partner.hisAddress
    hisEnterprise.hisBoss = partner.hisBoss
    hisEnterprise.hisAccountant = partner.hisAccountant
    return res.status(200).json({
        success : true,
        data : hisEnterprise
    })
})

// inn orqali oldin kiritlgan proxyni topish 
// proxyni kirgazayotganda qulaylik bolishi uchun 
// ozimizni  korxonani qidirish 
exports.openSearchInnMy = asyncHandler(async (req, res, next) => {
    const I = await Proxy.findOne({myEnterpriseInn : parseInt(req.params.id)})
    const myEnterprise = {}
    if(!I) {
        return res.status(404).json({
            success : false,
            message : "Inn raqamingizni notog\'ri kiritdinggiz "
        }) 
    }
    myEnterprise.myEnterpriseName = I.myEnterpriseName
    myEnterprise.myAccountNumber = I.myAccountNumber
    myEnterprise.mySWFT = I.mySWFT
    myEnterprise.myAddress = I.myAddress
    myEnterprise.myBoss = I.myBoss
    myEnterprise.myAccountant = I.myAccountant
    res.status(200).json({
        success : true,
        data : myEnterprise
    })
})