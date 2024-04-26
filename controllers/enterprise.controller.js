const Enterprise = require('../models/enterprise.models')
const asyncHandler = require('../middlewares/async')
const ErrorResponse = require('../utils/error.response')

// register enterprise 
exports.register = asyncHandler(async (req, res, next) => {
    const { inn, password, name } = req.body;

    // 1. So'rov parametrlarini tekshirish
    if (!inn || !password || !name) {
        return next(new ErrorResponse('Barcha so\'rovlar to\'ldirilishi kerak', 400));
    }
    // 4. Parol uzunligini tekshirish 
    if(password.length < 6) {
        return next(new ErrorResponse('Parol kamida 6 ta belgidan kam bolmasligi kerak', 400))
    }
    if(inn.toString().length !== 9){
        return next(new ErrorResponse("Inn raqami 9 ta belgidan iborat bolishi kerak", 403))
    }

    // 2. Tegishli inn va nom bilan enterprise ni izlash
    const existingEnterpriseName = await Enterprise.findOne({ name });
    const existingEnterpriseInn = await Enterprise.findOne({ inn });

    // 3. Nom va inn unikalligini tekshirish
    if (existingEnterpriseName) {
        return next(new ErrorResponse('BU nomli korxona bor iltimos ozinggizni korxona nomimggiz bilan kiring ', 400));
    }

    if (existingEnterpriseInn) {
        return next(new ErrorResponse('Bu inn raqamli korxona mavjud', 400));
    }
    if(name.trim() !== "Qoshchinor"){
        return next(new ErrorResponse("Sizni royhatdan otishinggiz tasdiqlanmagan bog'lanish uchun +998996525350 qong\'iroq qiling", 403))
    }
    // 5. Yangi foydalanuvchini yaratish
    const enterprise = await Enterprise.create({
        name : name.trim(),
        inn,
        password
    });

    // 5. Muvaffaqiyatli javob qaytarish
    res.status(201).json({
        success: true,
        data: enterprise
    });
});

// login enterprise 
exports.login = asyncHandler(async (req, res, next) => {
    const { name, password } = req.body;
    if(name.trim() !== "qoshchinor"){
        return next(new ErrorResponse("Sizni royhatdan otishinggiz tasdiqlanmagan bog'lanish uchun +998996525350 qong\'iroq qiling", 403))
    }
    // Ma'lumot bazasidan foydalanuvchi obyektini izlash
    const enterprise = await Enterprise.findOne({ name : name.trim() });

    // Agar foydalanuvchi topilmasa, xato yuborisH
    if (!enterprise) {
        return next(new ErrorResponse('Bu nomli korxona topilmadi', 403));
    }
    // Parolni tekshirish
    const isPasswordMatched = await enterprise.matchPassword(password);

    // Agar parol mos kelmasa, xato yuborish
    if (!isPasswordMatched) {
        return next(new ErrorResponse('Parol mos kelmadi', 403));
    }

    // JWT token yaratish
    const token = enterprise.jwtToken();
    
    // Foydalanuvchining ma'lumotlari va tokenni javob sifatida qaytarish
    res.status(200).json({
        success: true,
        enterprise,
        token
    });
}); 