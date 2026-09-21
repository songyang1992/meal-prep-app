// ============================================================
// 数据与知识库：来源 = 用户提供的健身餐笔记图片（营养素表、换算公式）
// + 中国居民膳食营养素参考摄入量（膳食纤维 25–30g/天）
// 价格为小象超市/七鲜超市北京参考价（2026 年 9 月口径），仅作估算
// ============================================================

// ---------- 目标配置 ----------
export type Gender = 'male' | 'female'
export type Goal = 'cut' | 'gain'

export interface RatioRange { min: number; max: number; def: number }

export interface GoalConfig {
  label: string
  desc: string
  kcalPerKg: [number, number] // 总热量估算系数
  ranges: Record<Gender, { carb: RatioRange; protein: RatioRange; fat: RatioRange }>
}

export const GOALS: Record<Goal, GoalConfig> = {
  cut: {
    label: '减脂',
    desc: '创造 300–500 大卡热量缺口，保住肌肉、刷掉脂肪（总热量≈体重×24~26）',
    kcalPerKg: [24, 26],
    ranges: {
      male: {
        carb: { min: 1, max: 3, def: 2.0 },
        protein: { min: 0.8, max: 2.0, def: 1.5 },
        fat: { min: 0.3, max: 1.0, def: 0.8 },
      },
      female: {
        carb: { min: 1, max: 3, def: 2.0 },
        protein: { min: 0.8, max: 1.8, def: 1.5 },
        fat: { min: 0.3, max: 0.9, def: 0.8 },
      },
    },
  },
  gain: {
    label: '增肌',
    desc: '创造 200–300 大卡热量盈余，最大化肌肉生长、控制脂肪堆积（总热量≈体重×32~35）',
    kcalPerKg: [32, 35],
    ranges: {
      male: {
        carb: { min: 1, max: 5, def: 4.0 },
        protein: { min: 0.8, max: 2.0, def: 1.9 },
        fat: { min: 0.3, max: 1.1, def: 0.8 },
      },
      female: {
        carb: { min: 1, max: 4, def: 3.5 },
        protein: { min: 0.8, max: 1.8, def: 1.7 },
        fat: { min: 0.3, max: 1.0, def: 0.8 },
      },
    },
  },
}

export const FIBER_TARGET = { min: 25, max: 30 } // g/天，中国营养学会 DRIs
export const VEG_TARGET = 500 // g/天（知识库：每日 500g 左右蔬菜）
export const FRUIT_TARGET = 250 // g/天，低 GI 优先（膳食指南 200–350g 取中值）

// ---------- 餐外固定项（卤蛋+水果）：热量计入全天目标，从正餐预算中扣除 ----------
export const FRUIT_PER100 = { carb: 10, kcal: 50 } // 蓝莓/草莓/猕猴桃均值（每 100g）
export const EGG_NUTRITION = { protein: 6.5, fat: 5.0, carb: 0.3, kcal: 70 } // 每枚（净约 50g）

// ---------- 换算常数（知识库） ----------
export const RAW_MEAT_PROTEIN = 0.2 // 生肉蛋白质≈20%：生肉=目标蛋白质÷0.2
export const RAW_STAPLE_CARB = 0.75 // 生主食碳水≈75%：生米面=目标碳水÷0.75
export const RICE_COOK_RATIO = 2.9 // 生米→熟饭（75÷26）
export const MEAT_COOK_RATIO = 0.65 // 生肉→熟肉（20÷31）

// ---------- 常见食物营养素（每 100g 熟重，知识库附表） ----------
export interface FoodNutrient {
  name: string
  carb: number
  protein: number
  fat: number
  kcal: number
  gi?: number
  category: 'carb' | 'protein' | 'fat'
}

export const FOODS: FoodNutrient[] = [
  // 优质碳水
  { name: '熟白米饭', carb: 26, protein: 2.7, fat: 0.3, kcal: 120, gi: 73, category: 'carb' },
  { name: '熟白面条', carb: 28, protein: 3.0, fat: 0.5, kcal: 125, gi: 81, category: 'carb' },
  { name: '白馒头', carb: 45, protein: 7.0, fat: 1.1, kcal: 220, gi: 88, category: 'carb' },
  { name: '熟糙米饭', carb: 24, protein: 2.8, fat: 0.8, kcal: 115, gi: 68, category: 'carb' },
  { name: '熟燕麦粥', carb: 12, protein: 2.5, fat: 1.5, kcal: 55, gi: 60, category: 'carb' },
  { name: '熟红薯', carb: 22, protein: 1.6, fat: 0.1, kcal: 90, gi: 70, category: 'carb' },
  { name: '熟土豆', carb: 17, protein: 2.0, fat: 0.2, kcal: 80, gi: 65, category: 'carb' },
  { name: '鲜甜玉米', carb: 17, protein: 3.0, fat: 1.2, kcal: 95, gi: 55, category: 'carb' },
  // 优质蛋白质
  { name: '熟鸡胸肉', carb: 0, protein: 31, fat: 3.6, kcal: 165, category: 'protein' },
  { name: '熟去皮鸡腿肉', carb: 0, protein: 29, fat: 6.0, kcal: 175, category: 'protein' },
  { name: '熟瘦牛肉', carb: 0, protein: 31, fat: 5.5, kcal: 185, category: 'protein' },
  { name: '熟瘦羊肉', carb: 0, protein: 29, fat: 7.0, kcal: 190, category: 'protein' },
  { name: '熟猪瘦肉', carb: 0, protein: 27, fat: 6.5, kcal: 175, category: 'protein' },
  { name: '熟鲈鱼', carb: 0, protein: 24, fat: 2.5, kcal: 130, category: 'protein' },
  { name: '熟虾仁', carb: 0, protein: 21, fat: 1.5, kcal: 105, category: 'protein' },
  { name: '水煮鸡蛋', carb: 0.6, protein: 13, fat: 11, kcal: 155, category: 'protein' },
  { name: '纯牛奶', carb: 3.2, protein: 3.6, fat: 3.8, kcal: 105, category: 'protein' },
  // 优质脂肪
  { name: '花生油', carb: 0, protein: 0, fat: 99.9, kcal: 897, category: 'fat' },
  { name: '橄榄油', carb: 0, protein: 0, fat: 99.9, kcal: 897, category: 'fat' },
  { name: '黄油', carb: 0, protein: 1, fat: 81, kcal: 717, category: 'fat' },
  { name: '花生酱(无添加)', carb: 20, protein: 25, fat: 50, kcal: 590, category: 'fat' },
  { name: '巴旦木', carb: 19, protein: 21, fat: 50, kcal: 579, category: 'fat' },
  { name: '核桃仁', carb: 14, protein: 15, fat: 65, kcal: 654, category: 'fat' },
  { name: '腰果', carb: 27, protein: 18, fat: 44, kcal: 553, category: 'fat' },
  { name: '芝麻酱', carb: 18, protein: 19, fat: 53, kcal: 600, category: 'fat' },
]

// ---------- 估量口诀（知识库） ----------
export const HAND_RULE = {
  text: '1 拳头主食 + 1 掌心肉 + 2 拳头蔬菜 + 1 拇指油',
  stapleFist: '1 拳头熟主食 ≈ 150–180g',
  meatPalm: '1 掌心熟肉 ≈ 100–120g',
  vegFist: '1 拳头蔬菜 ≈ 100–125g',
  oilThumb: '1 拇指油 ≈ 5–8g',
}

// ---------- 购物清单 ----------
export type ShopCategory = 'meat' | 'staple' | 'veg' | 'fruit' | 'seasoning'

export const CATEGORY_META: Record<ShopCategory, { label: string; icon: string }> = {
  meat: { label: '肉蛋水产', icon: '🥩' },
  staple: { label: '主食杂粮', icon: '🍚' },
  veg: { label: '蔬菜', icon: '🥦' },
  fruit: { label: '水果', icon: '🫐' },
  seasoning: { label: '调味干货', icon: '🧂' },
}

export interface ShopItem {
  id: string
  name: string
  category: ShopCategory
  spec: string // 售卖规格，如 "500g/份"
  unitPrice: number // 参考单价（元/规格）
  priceNote?: string
  // 数量规则：'grams' = 按克需求换算成规格份数（向上取整）；'fixed' = 固定份数；'count' = 按个
  qtyRule:
    | { type: 'grams'; gramsPerUnit: number; share: number } // share = 占该类需求的比例
    | { type: 'fixed'; qty: number }
  group: 'meat' | 'stapleGrain' | 'stapleTuber' | 'veg' | 'fruit' | 'seasoning' // 需求池
  tip?: string
}

// 参考价：小象超市/七鲜超市北京常见售价（2026-09 口径，仅供估算，下单前请核对）
export const SHOP_ITEMS: ShopItem[] = [
  // --- 肉蛋水产（占蛋白质需求的份额） ---
  { id: 'beef-shank', name: '牛腱子', category: 'meat', spec: '500g/份', unitPrice: 42.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.35 }, group: 'meat',
    tip: '卤牛腱主料，冷冻分装复热口感最好' },
  { id: 'chicken-breast', name: '冰鲜鸡胸肉', category: 'meat', spec: '500g/份', unitPrice: 16.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.30 }, group: 'meat',
    tip: '蒜香黑椒煎/烤，切厚片不易柴' },
  { id: 'chicken-leg', name: '去皮鸡腿肉', category: 'meat', spec: '500g/份', unitPrice: 19.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.20 }, group: 'meat',
    tip: '和牛腱同锅卤，40 分钟先捞出' },
  { id: 'shrimp', name: '冷冻虾仁', category: 'meat', spec: '500g/袋', unitPrice: 35.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.15 }, group: 'meat',
    tip: '白灼 90 秒，过冰水更弹' },
  { id: 'eggs', name: '鲜鸡蛋', category: 'meat', spec: '30枚/盒(约1.6kg)', unitPrice: 21.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'meat',
    tip: '卤蛋不装盒：带卤汁冷藏、前 4 天吃完；后半周换带壳水煮蛋（带壳冷藏可放 5–7 天）' },

  // --- 主食杂粮 ---
  { id: 'rice', name: '大米', category: 'staple', spec: '2.5kg/袋', unitPrice: 29.9,
    qtyRule: { type: 'grams', gramsPerUnit: 2500, share: 0.5 }, group: 'stapleGrain',
    tip: '杂粮饭基底' },
  { id: 'brown-rice', name: '糙米', category: 'staple', spec: '500g/袋', unitPrice: 8.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.3 }, group: 'stapleGrain',
    tip: '提前泡 2 小时以上再混煮' },
  { id: 'millet', name: '小米', category: 'staple', spec: '500g/袋', unitPrice: 7.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.2 }, group: 'stapleGrain',
    tip: '少量混煮提香' },
  { id: 'sweet-potato', name: '红薯', category: 'staple', spec: '500g/份', unitPrice: 4.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.6 }, group: 'stapleTuber',
    tip: '蒸熟冷冻，复热后口感几乎不变' },
  { id: 'corn', name: '甜玉米', category: 'staple', spec: '1根(约300g)', unitPrice: 3.5,
    qtyRule: { type: 'grams', gramsPerUnit: 300, share: 0.4 }, group: 'stapleTuber',
    tip: '蒸熟切段冷冻' },

  // --- 蔬菜（耐冷冻为先） ---
  { id: 'broccoli', name: '西兰花', category: 'veg', spec: '500g/份', unitPrice: 6.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.35 }, group: 'veg',
    tip: '焯水 90 秒过冷水，冷冻后复热口感稳' },
  { id: 'carrot', name: '胡萝卜', category: 'veg', spec: '500g/份', unitPrice: 3.5,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.15 }, group: 'veg',
    tip: '切滚刀块焯水，耐冻' },
  { id: 'spinach', name: '菠菜', category: 'veg', spec: '500g/份', unitPrice: 5.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.2 }, group: 'veg',
    tip: '焯水 30 秒挤干水分再冷冻' },
  { id: 'bell-pepper', name: '彩椒', category: 'veg', spec: '1个(约150g)', unitPrice: 4.5,
    qtyRule: { type: 'grams', gramsPerUnit: 150, share: 0.15 }, group: 'veg',
    tip: '切条焯水 30 秒' },
  { id: 'mushroom', name: '口蘑', category: 'veg', spec: '500g/份', unitPrice: 8.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.15 }, group: 'veg',
    tip: '切片干煸或焯水，耐冻' },

  // --- 水果（不冷冻，随餐或加餐生吃） ---
  { id: 'blueberry', name: '蓝莓', category: 'fruit', spec: '125g/盒', unitPrice: 12.9,
    qtyRule: { type: 'grams', gramsPerUnit: 125, share: 0.3 }, group: 'fruit',
    tip: '低 GI 首选，冷藏 5 天内吃完' },
  { id: 'strawberry', name: '草莓', category: 'fruit', spec: '500g/盒', unitPrice: 19.9,
    qtyRule: { type: 'grams', gramsPerUnit: 500, share: 0.4 }, group: 'fruit',
    tip: '冷藏 3 天内吃完，排在周前几天吃' },
  { id: 'kiwi', name: '猕猴桃', category: 'fruit', spec: '1个(约100g)', unitPrice: 3.9,
    qtyRule: { type: 'grams', gramsPerUnit: 100, share: 0.3 }, group: 'fruit',
    tip: '耐放，安排在周后几天' },

  // --- 调味干货 ---
  { id: 'lu-spice', name: '卤料包', category: 'seasoning', spec: '1包(5小包)', unitPrice: 8.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning',
    tip: '含八角/桂皮/香叶/花椒/草果等，省事；也可自配' },
  { id: 'scallion', name: '大葱', category: 'seasoning', spec: '1把(约300g)', unitPrice: 3.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '焯水、卤锅、腌肉都用' },
  { id: 'ginger', name: '生姜', category: 'seasoning', spec: '500g/份', unitPrice: 5.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '去腥主力' },
  { id: 'garlic', name: '大蒜', category: 'seasoning', spec: '500g/份', unitPrice: 6.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '蒜香鸡胸灵魂' },
  { id: 'light-soy', name: '生抽', category: 'seasoning', spec: '500ml/瓶', unitPrice: 9.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '家中常备，有就不用买' },
  { id: 'dark-soy', name: '老抽', category: 'seasoning', spec: '500ml/瓶', unitPrice: 10.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '卤味上色，家中常备' },
  { id: 'cooking-wine', name: '料酒', category: 'seasoning', spec: '500ml/瓶', unitPrice: 7.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '焯水去腥' },
  { id: 'oyster-sauce', name: '蚝油', category: 'seasoning', spec: '700g/瓶', unitPrice: 8.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '腌肉/拌菜' },
  { id: 'black-pepper', name: '黑胡椒碎', category: 'seasoning', spec: '50g/瓶', unitPrice: 9.9,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '鸡胸/虾仁通用' },
  { id: 'rock-sugar', name: '冰糖', category: 'seasoning', spec: '500g/袋', unitPrice: 6.5,
    qtyRule: { type: 'fixed', qty: 1 }, group: 'seasoning', tip: '卤汁提鲜上色，用量很少' },
]

// ---------- 油脂建议（不进购物清单） ----------
export const OIL_ADVICE = [
  { name: '特级初榨橄榄油', use: '凉拌、低温烹调', note: '单不饱和脂肪酸高，备餐拌菜首选' },
  { name: '山茶油 / 低芥酸菜籽油', use: '日常炒菜', note: '烟点高、脂肪酸构成好，煎鸡胸用它' },
  { name: '亚麻籽油', use: '只凉拌不加热', note: '补充 ω-3，淋在复热后的蔬菜上' },
  { name: '花生油', use: '偶尔增香', note: '香味足，卤味/爆香少量即可' },
]

// ---------- 菜谱 ----------
export interface Recipe {
  id: string
  name: string
  covers: string // 覆盖哪些餐
  ingredients: string[] // 会随计算联动标注
  steps: string[]
  freezeTip: string
  reheatTip: string
  advance?: string // 需要提前做的事（如泡冷水）
}

export const RECIPES: Recipe[] = [
  {
    id: 'lu-beef',
    name: '卤牛腱',
    covers: '周一/三/五午餐、周二晚餐 的主蛋白',
    advance: '周六晚：牛腱整块泡冷水 2 小时以上（最好过夜冷藏），中途换水 2–3 次泡出血水，这是不腥的关键',
    ingredients: ['牛腱（按清单量）', '卤料包 1 小包', '姜片 5 片', '葱段 2 段', '生抽 4 勺', '老抽 2 勺', '料酒 2 勺', '冰糖 5–6 粒'],
    steps: [
      '泡好的牛腱冷水下锅，加姜片+料酒，大火煮开撇净浮沫，捞出洗净（焯水）',
      '卤锅加水没过肉，放卤料包+生抽+老抽+冰糖+葱姜，大火烧开',
      '转小火盖盖卤 90 分钟，筷子能轻松插入即可',
      '关火后别捞！在卤汁里泡 1 小时以上更入味（可放冰箱冷藏浸泡）',
      '捞出彻底放凉后再切片，热切会散',
    ],
    freezeTip: '按每餐量切片分装冷冻，卤汁留一小袋一起冻，复热时更润',
    reheatTip: '带卤汁微波中高火 2 分钟，或蒸 8 分钟',
  },
  {
    id: 'lu-chicken-egg',
    name: '卤鸡腿 + 卤蛋',
    covers: '周二/四午餐、周一晚餐 的主蛋白；卤蛋每天 1 个加餐',
    ingredients: ['去皮鸡腿（按清单量）', '鸡蛋 7–10 个', '与卤牛腱同一锅卤汁'],
    steps: [
      '鸡蛋冷水下锅煮 8 分钟，过冷水剥壳，表面划两刀',
      '牛腱卤到 50 分钟时，下鸡腿同卤',
      '再卤 40 分钟后先捞鸡腿（此时牛腱共 90 分钟也好了）',
      '剥壳鸡蛋放进卤汁，关火随牛腱一起浸泡入味',
    ],
    freezeTip: '鸡腿去骨切块分装冷冻；卤蛋不装盒也不冷冻：带卤汁冷藏 4 天内吃完，后半周改用带壳水煮蛋（带壳冷藏可放 5–7 天）',
    reheatTip: '微波中高火 2 分钟；卤蛋冷吃或温水泡热',
  },
  {
    id: 'chicken-breast',
    name: '蒜香黑椒鸡胸',
    covers: '周三/五晚餐、周六午/晚餐 的主蛋白',
    ingredients: ['鸡胸肉（按清单量）', '蒜末 1 头', '黑胡椒碎 1 勺', '生抽 2 勺', '蚝油 1 勺', '山茶油/菜籽油 1 勺', '盐少许'],
    steps: [
      '鸡胸横刀片成 1.5cm 厚片，用刀背轻拍松',
      '加所有腌料抓匀，腌 20 分钟（备餐间隙腌上即可）',
      '平底锅刷薄油，中火每面煎 2 分钟，盖盖焖 1 分钟',
      '或用烤箱 200°C 烤 15 分钟，中途翻面',
      '出锅静置 5 分钟再切，锁住汁水不柴',
    ],
    freezeTip: '煎好后按餐分装冷冻，口感略降但可接受；想更好吃可留 2 份冷藏周一周二先吃',
    reheatTip: '微波中火 90 秒，别久热，久热必柴',
  },
  {
    id: 'shrimp',
    name: '白灼虾仁',
    covers: '周四/日晚餐 的主蛋白',
    ingredients: ['虾仁（按清单量）', '姜片 3 片', '料酒 1 勺', '盐少许', '黑胡椒碎 半勺'],
    steps: [
      '虾仁解冻，挑去虾线，厨房纸吸干水分',
      '水烧开加姜+料酒+盐，下虾仁煮 90 秒变色即捞',
      '立刻过冰水 1 分钟，肉质更弹',
      '沥干后拌入黑胡椒碎+少许盐入底味，再按餐分装',
      '吃时蘸生抽+醋+蒜末调的汁（汁随吃随调，不预拌）',
    ],
    freezeTip: '焯熟后沥干分装冷冻',
    reheatTip: '微波中火 60–90 秒；也可以不加热直接拌进复热好的蔬菜里',
  },
  {
    id: 'grains',
    name: '杂粮饭 + 蒸红薯玉米',
    covers: '全部 14 餐的主食轮换',
    advance: '周六晚：糙米+小米淘洗后泡水（和牛腱同步进行）',
    ingredients: ['大米:糙米:小米 ≈ 5:3:2（按清单总量）', '红薯、甜玉米（按清单量）'],
    steps: [
      '杂粮按比例混合，水量比平时白米饭多半指节',
      '电饭煲正常煮饭模式，煮好后焖 10 分钟',
      '红薯洗净、玉米切段，蒸锅上汽后蒸 20 分钟',
      '全部摊开晾到不烫手再分装（热分装会产生水汽，冻后口感差）',
    ],
    freezeTip: '米饭按每餐量压平装盒冷冻，可存 1 周以上',
    reheatTip: '米饭表面洒几滴水，微波高火 2 分钟；红薯玉米蒸 8 分钟或微波 2 分钟',
  },
  {
    id: 'veg-mix',
    name: '焯水什锦蔬菜',
    covers: '全部 14 餐的蔬菜',
    ingredients: ['西兰花/胡萝卜/菠菜/彩椒/口蘑（按清单比例）', '盐 1 勺', '油几滴'],
    steps: [
      '大锅烧水，加 1 勺盐和几滴油（保色）',
      '分批焯水：西兰花/胡萝卜 90 秒 → 彩椒/口蘑 30 秒 → 菠菜 30 秒',
      '每批捞出立刻过冷水（或冰水），彻底沥干',
      '菠菜务必挤干水分再分装，否则冻后一滩水',
    ],
    freezeTip: '按每餐 200–250g 混装冷冻',
    reheatTip: '微波 90 秒，淋少许亚麻籽油/橄榄油+生抽拌匀',
  },
]

// ---------- 周末备餐时间线 ----------
export interface PrepBlock {
  time: string
  title: string
  tracks: { lane: string; items: string[] }[]
}

export const PREP_SATURDAY: PrepBlock = {
  time: '周六晚 · 10 分钟预处理',
  title: '睡前搞定两件事，周日不慌乱',
  tracks: [
    { lane: '泡肉', items: ['牛腱整块泡冷水，放冰箱冷藏过夜（中途想起就换次水）'] },
    { lane: '泡米', items: ['糙米+小米淘洗后加水泡上，室温或冷藏均可'] },
  ],
}

export const PREP_SUNDAY: PrepBlock[] = [
  {
    time: '0:00–0:15',
    title: '点火开工',
    tracks: [
      { lane: '灶台 1', items: ['牛腱焯水：冷水下锅+姜+料酒，煮开撇沫，捞出洗净'] },
      { lane: '电饭煲', items: ['杂粮饭下锅（米是昨晚泡好的）'] },
      { lane: '蒸锅', items: ['红薯、玉米上锅蒸 20 分钟后关火'] },
    ],
  },
  {
    time: '0:15–1:45',
    title: '卤锅主力时段（90 分钟小火）',
    tracks: [
      { lane: '灶台 1（卤锅）', items: ['下卤料+牛腱，大火烧开转小火', '50 分钟时下鸡腿', '鸡蛋另锅煮 8 分钟剥壳', '90 分钟鸡腿、牛腱先后出锅，蛋回卤汁浸泡'] },
      { lane: '灶台 2（煎锅）', items: ['鸡胸腌 20 分钟', '分批煎/烤鸡胸', '虾仁白灼 90 秒过冰水拌黑椒'] },
      { lane: '备菜台', items: ['蔬菜洗净切配，分好焯水批次'] },
    ],
  },
  {
    time: '1:45–2:15',
    title: '蔬菜焯水',
    tracks: [
      { lane: '灶台 2', items: ['大锅水+盐+几滴油', '分批焯水→过冷水→沥干', '菠菜挤干水分'] },
    ],
  },
  {
    time: '2:15–3:00',
    title: '分装 14 盒',
    tracks: [
      { lane: '备菜台', items: ['厨房秤称重分装：主食+蛋白+蔬菜入盒', '贴标签：日期+午/晚+热量', '周一二的 4 盒冷藏，其余 10 盒冷冻', '卤汁分小袋冷冻（复热牛肉用）'] },
    ],
  },
]

// ---------- 保存与复热 ----------
export const STORAGE_RULES = [
  { title: '冷藏（0–4°C）', body: '只放周一、周二的 4 盒，熟食菜盒冷藏别超过 48 小时。卤蛋不装盒：带卤汁冷藏 4 天内吃完，后半周吃带壳水煮蛋。' },
  { title: '冷冻（-18°C）', body: '其余 10 盒全部冷冻。蔬菜焯水后冷冻 1 周口感稳定；米饭压平冻，受热均匀。' },
  { title: '解冻', body: '前一晚把第二天要吃的盒子从冷冻挪到冷藏，低温慢解冻最安全。' },
  { title: '复热', body: '微波高火 2–3 分钟（米饭洒几滴水），或上汽蒸 8–10 分钟。加热到中心烫手再吃。' },
  { title: '绝不二次冷冻', body: '解冻后的盒子 24 小时内吃完，吃不完丢弃，不要再冻回去。' },
]

export const PRICE_DISCLAIMER =
  '所有单价为小象超市/七鲜超市北京参考价（2026 年 9 月口径），仅用于预算估算，实际以下单页为准；规格/份数/单价都可直接修改，总价自动重算。'

export const NUTRITION_DISCLAIMER =
  '营养素数据来自你提供的健身餐笔记（与《中国食物成分表》口径一致），膳食纤维目标 25–30g/天来自中国营养学会 DRIs。本工具是膳食参考，不构成医疗建议。'
