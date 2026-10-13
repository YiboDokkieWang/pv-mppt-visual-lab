const state = {
  data: null,
  conditionIndex: 0,
  history: [],
  currentIteration: 0,
  timer: null,
  playing: false,
  algorithm: 'po',
  language: 'en',
};
let renderFrameHandle = 0;
let canvasResizeObserver = null;

const systemDiagramImage = new Image();
systemDiagramImage.src = './assets/mppt-system-irradiance-v2.png';
systemDiagramImage.addEventListener('load', () => {
  if (state.data) queueCanvasRender();
});

const conditionIrradiancePatterns = [
  [1000, 1000, 1000, 1000],
  [1000, 1000, 600, 600],
  [1000, 800, 600, 400],
];

const irradianceColors = {
  1000: '#19aa50',
  800: '#0b843d',
  600: '#08642f',
  400: '#064723',
};

const LANGUAGE_STORAGE_KEY = 'pvLabLanguageV2';

const $ = (selector) => document.querySelector(selector);
const controls = {
  particleCount: $('#particleCount'),
  inertia: $('#inertia'),
  cognitive: $('#cognitive'),
  social: $('#social'),
  iterations: $('#iterations'),
  maxVelocity: $('#maxVelocity'),
  initialDistribution: $('#initialDistribution'),
  poStep: $('#poStep'),
  poIterations: $('#poIterations'),
  poMaxVelocity: $('#poMaxVelocity'),
  hcStep: $('#hcStep'),
  hcDeadband: $('#hcDeadband'),
  hcMaxVelocity: $('#hcMaxVelocity'),
  hcIterations: $('#hcIterations'),
  vpoMinStep: $('#vpoMinStep'),
  vpoMaxStep: $('#vpoMaxStep'),
  vpoSlopeGain: $('#vpoSlopeGain'),
  vpoMaxVelocity: $('#vpoMaxVelocity'),
  vpoIterations: $('#vpoIterations'),
  jeincStep: $('#jeincStep'),
  jeincJumpDepth: $('#jeincJumpDepth'),
  jeincMaxJumps: $('#jeincMaxJumps'),
  jeincIterations: $('#jeincIterations'),
  jeincMaxVelocity: $('#jeincMaxVelocity'),
  cvtVoc: $('#cvtVoc'),
  cvtIterations: $('#cvtIterations'),
  cvtMaxVelocity: $('#cvtMaxVelocity'),
  focvRatio: $('#focvRatio'),
  focvSamplePeriod: $('#focvSamplePeriod'),
  focvMaxVelocity: $('#focvMaxVelocity'),
  focvIterations: $('#focvIterations'),
  scanStep: $('#scanStep'),
  scanHold: $('#scanHold'),
  scanMaxVelocity: $('#scanMaxVelocity'),
  scanIterations: $('#scanIterations'),
  escAmplitude: $('#escAmplitude'),
  escGain: $('#escGain'),
  escPeriod: $('#escPeriod'),
  escMaxVelocity: $('#escMaxVelocity'),
  escIterations: $('#escIterations'),
  saTemperature: $('#saTemperature'),
  saCooling: $('#saCooling'),
  saStep: $('#saStep'),
  saIterations: $('#saIterations'),
  gaPopulation: $('#gaPopulation'),
  gaCrossover: $('#gaCrossover'),
  gaMutation: $('#gaMutation'),
  gaMutationSpan: $('#gaMutationSpan'),
  gaInitialDistribution: $('#gaInitialDistribution'),
  gaIterations: $('#gaIterations'),
  csNests: $('#csNests'),
  csLevyScale: $('#csLevyScale'),
  csDiscovery: $('#csDiscovery'),
  csInitialDistribution: $('#csInitialDistribution'),
  csIterations: $('#csIterations'),
  incStep: $('#incStep'),
  incTolerance: $('#incTolerance'),
  incMaxVelocity: $('#incMaxVelocity'),
  incIterations: $('#incIterations'),
  vincMinStep: $('#vincMinStep'),
  vincMaxStep: $('#vincMaxStep'),
  vincCompensation: $('#vincCompensation'),
  vincTolerance: $('#vincTolerance'),
  vincMaxVelocity: $('#vincMaxVelocity'),
  vincIterations: $('#vincIterations'),
  mpcStep: $('#mpcStep'),
  mpcHorizon: $('#mpcHorizon'),
  mpcPenalty: $('#mpcPenalty'),
  mpcMaxVelocity: $('#mpcMaxVelocity'),
  mpcIterations: $('#mpcIterations'),
  fuzzyStep: $('#fuzzyStep'),
  fuzzyErrorGain: $('#fuzzyErrorGain'),
  fuzzyDeltaGain: $('#fuzzyDeltaGain'),
  fuzzyIterations: $('#fuzzyIterations'),
  abcPopulation: $('#abcPopulation'),
  abcPhi: $('#abcPhi'),
  abcBestGain: $('#abcBestGain'),
  abcAbandonLimit: $('#abcAbandonLimit'),
  abcInitialDistribution: $('#abcInitialDistribution'),
  abcIterations: $('#abcIterations'),
  afsaPopulation: $('#afsaPopulation'),
  afsaVisual: $('#afsaVisual'),
  afsaStep: $('#afsaStep'),
  afsaCrowd: $('#afsaCrowd'),
  afsaTry: $('#afsaTry'),
  afsaInitialDistribution: $('#afsaInitialDistribution'),
  afsaIterations: $('#afsaIterations'),
  dePopulation: $('#dePopulation'),
  deFactor: $('#deFactor'),
  deCrossover: $('#deCrossover'),
  deInitialDistribution: $('#deInitialDistribution'),
  deIterations: $('#deIterations'),
  nnHidden: $('#nnHidden'),
  nnLearningRate: $('#nnLearningRate'),
  nnEpochs: $('#nnEpochs'),
  nnMaxVelocity: $('#nnMaxVelocity'),
  nnIterations: $('#nnIterations'),
  svrPenalty: $('#svrPenalty'),
  svrEpsilon: $('#svrEpsilon'),
  svrGamma: $('#svrGamma'),
  svrMaxVelocity: $('#svrMaxVelocity'),
  svrIterations: $('#svrIterations'),
  rfTrees: $('#rfTrees'),
  rfDepth: $('#rfDepth'),
  rfSampleRatio: $('#rfSampleRatio'),
  rfMaxVelocity: $('#rfMaxVelocity'),
  rfIterations: $('#rfIterations'),
  rlLearningRate: $('#rlLearningRate'),
  rlDiscount: $('#rlDiscount'),
  rlExploration: $('#rlExploration'),
  rlEpisodes: $('#rlEpisodes'),
  rlStep: $('#rlStep'),
  rlIterations: $('#rlIterations'),
  dqnLearningRate: $('#dqnLearningRate'), dqnDiscount: $('#dqnDiscount'), dqnExploration: $('#dqnExploration'), dqnReplay: $('#dqnReplay'), dqnStep: $('#dqnStep'), dqnIterations: $('#dqnIterations'),
  sacActorRate: $('#sacActorRate'), sacDiscount: $('#sacDiscount'), sacEntropy: $('#sacEntropy'), sacMaxAction: $('#sacMaxAction'), sacIterations: $('#sacIterations'),
  psoPoPopulation: $('#psoPoPopulation'), psoPoSwitch: $('#psoPoSwitch'), psoPoStep: $('#psoPoStep'), psoPoInitialDistribution: $('#psoPoInitialDistribution'), psoPoIterations: $('#psoPoIterations'),
  gaPoPopulation: $('#gaPoPopulation'), gaPoMutation: $('#gaPoMutation'), gaPoStep: $('#gaPoStep'), gaPoInitialDistribution: $('#gaPoInitialDistribution'), gaPoIterations: $('#gaPoIterations'),
  gaFuzzyPopulation: $('#gaFuzzyPopulation'), gaFuzzyStep: $('#gaFuzzyStep'), gaFuzzyGain: $('#gaFuzzyGain'), gaFuzzyInitialDistribution: $('#gaFuzzyInitialDistribution'), gaFuzzyIterations: $('#gaFuzzyIterations'),
  gaAnnPopulation: $('#gaAnnPopulation'), gaAnnMutation: $('#gaAnnMutation'), gaAnnGuide: $('#gaAnnGuide'), gaAnnInitialDistribution: $('#gaAnnInitialDistribution'), gaAnnIterations: $('#gaAnnIterations'),
  updateTime: $('#updateTime'),
  inductance: $('#inductance'),
  capacitance: $('#capacitance'),
  outputCapacitance: $('#outputCapacitance'),
  loadResistance: $('#loadResistance'),
  algorithmCategory: $('#algorithmCategory'),
  algorithmSelect: $('#algorithmSelect'),
};

const format = (value, digits = 2) => Number(value).toFixed(digits);
const particleColors = ['#f36d32', '#6657d9', '#00a6a6', '#d99a00', '#1b7f3a', '#d44574', '#3977cf', '#8a5a44', '#7f9c2a', '#7540a8'];
const boostModel = {
  inductorResistance: 0.15,
  dutyMin: 0.02,
  dutyMax: 0.95,
  voltageToCurrentGain: 0.12,
  currentKp: 0.04,
  currentKi: 40,
  currentMax: 15,
  softStartMs: 0.2,
  sampleWindowRatio: 0.2,
};
const algorithmContent = {
  po: {
    shortName: 'P&O',
    title: '扰动观察法(P&O)实现光伏MPPT',
    description: '扰动观察法在当前工作电压上施加固定小扰动，根据功率变化判断下一步的搜索方向。',
    formulaLabelOne: '功率与电压变化',
    formulaOne: 'ΔP(k) = P(k) − P(k−1), &nbsp; ΔU(k) = U(k) − U(k−1)',
    formulaLabelTwo: '参考电压更新',
    formulaTwo: 'U<sub>ref</sub>(k+1) = U<sub>ref</sub>(k) + ΔU<sub>step</sub> · sgn[ΔP(k)ΔU(k)]',
    chartTitle: '工作点功率轨迹',
    runLabel: '运行 P&O',
    iterationKey: 'poIterations',
  },
  hc: {
    shortName: 'HC',
    title: '爬山法(HC)实现光伏MPPT',
    description: '爬山法比较相邻电压点的功率，功率上升时继续前进，功率下降时反向搜索。',
    formulaLabelOne: '功率比较',
    formulaOne: 'ΔP(k) = P(k) − P(k−1)',
    formulaLabelTwo: '爬山方向',
    formulaTwo: 'd(k+1) = d(k) &nbsp; if &nbsp; ΔP &gt; ε<sub>P</sub>; &nbsp; else &nbsp; d(k+1) = −d(k)',
    chartTitle: '爬山搜索功率轨迹',
    runLabel: '运行 HC',
    iterationKey: 'hcIterations',
  },
  vpo: {
    shortName: 'VSS-P&O',
    title: '变步长扰动观察法(VSS-P&O)实现光伏MPPT',
    description: '变步长扰动观察法根据 P–U 曲线斜率调节扰动量，远离 MPP 时加快，接近 MPP 时自动减小步长。',
    formulaLabelOne: '自适应步长',
    formulaOne: 'ΔU(k) = clamp[ΔU<sub>min</sub> + K<sub>s</sub>|ΔP/ΔU|, ΔU<sub>min</sub>, ΔU<sub>max</sub>]',
    formulaLabelTwo: '方向更新',
    formulaTwo: 'd(k+1) = d(k) · sgn[ΔP(k)ΔU(k)]',
    chartTitle: '变步长 P&O 功率轨迹',
    runLabel: '运行 VSS-P&O',
    iterationKey: 'vpoIterations',
  },
  jeinc: {
    shortName: 'JEINC',
    title: '跃变探索式电导增量法(JEINC)实现光伏MPPT',
    description: '跃变探索式电导增量法在局部寻优后跨过当前峰值继续探索，并保留已发现的最优工作点。',
    formulaLabelOne: '电导增量判据',
    formulaOne: 'dP/dU = I + U·dI/dU = 0 &nbsp; ⇒ &nbsp; dI/dU = −I/U',
    formulaLabelTwo: '跃变探索',
    formulaTwo: 'U<sub>ref</sub>(k+1) = U<sub>ref</sub>(k) + U<sub>e</sub>, &nbsp; n<sub>jump</sub> ≤ N',
    chartTitle: '跃变探索工作点功率',
    runLabel: '运行 JEINC',
    iterationKey: 'jeincIterations',
  },
  cvt: {
    shortName: 'CVT',
    title: '固定电压法(CVT)实现光伏MPPT',
    description: '固定电压法利用最大功率点电压与开路电压的近似比例关系，将阵列工作电压设定在一个固定参考值。',
    formulaLabelOne: '参考电压',
    formulaOne: 'U<sub>ref</sub> = K<sub>oc</sub> · U<sub>oc</sub>, &nbsp; K<sub>oc</sub> = 0.76',
    formulaLabelTwo: '工作点功率',
    formulaTwo: 'P<sub>CVT</sub> = P(U<sub>ref</sub>)',
    chartTitle: '固定工作点功率',
    runLabel: '运行 CVT',
    iterationKey: 'cvtIterations',
  },
  focv: {
    shortName: 'FOCV',
    title: '开路电压法(FOCV)实现光伏MPPT',
    description: '开路电压法周期性测量阵列开路电压，并按照经验比例 Koc 计算最大功率点附近的参考电压。',
    formulaLabelOne: '周期性开路采样',
    formulaOne: 'U<sub>oc</sub>(k) = U<sub>pv</sub>(k) &nbsp; when &nbsp; I<sub>pv</sub> = 0',
    formulaLabelTwo: '参考电压',
    formulaTwo: 'U<sub>ref</sub>(k) = K<sub>oc</sub> · U<sub>oc</sub>(k)',
    chartTitle: '开路电压法工作点功率',
    runLabel: '运行 FOCV',
    iterationKey: 'focvIterations',
  },
  scan: {
    shortName: 'VS',
    title: '电压扫描法(VS)实现光伏MPPT',
    description: '电压扫描法按设定步长遍历允许电压范围，记录扫描过程中的最大功率点，并在扫描完成后返回该工作点。',
    formulaLabelOne: '扫描电压',
    formulaOne: 'U<sub>ref</sub>(k+1) = U<sub>ref</sub>(k) + ΔU<sub>scan</sub>',
    formulaLabelTwo: '最优点保持',
    formulaTwo: 'U<sub>MPP</sub> = arg max<sub>U∈Ω<sub>scan</sub></sub> P(U)',
    chartTitle: '电压扫描功率轨迹',
    runLabel: '运行 VS',
    tracksBest: true,
    iterationKey: 'scanIterations',
  },
  esc: {
    shortName: 'ESC',
    title: '极值搜索控制(ESC)实现光伏MPPT',
    description: '极值搜索控制在参考电压上叠加小幅周期扰动，通过功率响应估计梯度，并用积分环节推动平均工作点趋近功率极值。',
    formulaLabelOne: '电压扰动',
    formulaOne: 'U<sub>ref</sub>(k) = Ū(k) + A sin(ωk)',
    formulaLabelTwo: '梯度积分更新',
    formulaTwo: 'Ū(k+1) = Ū(k) + K · ∇̂P(k)',
    chartTitle: '极值搜索功率轨迹',
    runLabel: '运行 ESC',
    iterationKey: 'escIterations',
  },
  pso: {
    shortName: 'PSO',
    title: '粒子群算法(PSO)实现光伏MPPT',
    description: '粒子群算法将工作电压视为粒子位置，利用个体最优与全局最优信息在 P–U 曲线上搜索最大功率点。',
    formulaLabelOne: '速度更新',
    formulaOne: 'v<sub>i</sub><sup>k+1</sup> = wv<sub>i</sub><sup>k</sup> + c<sub>1</sub>r<sub>1</sub>(pbest<sub>i</sub> − x<sub>i</sub><sup>k</sup>) + c<sub>2</sub>r<sub>2</sub>(gbest − x<sub>i</sub><sup>k</sup>)',
    formulaLabelTwo: '位置更新',
    formulaTwo: 'x<sub>i</sub><sup>k+1</sup> = x<sub>i</sub><sup>k</sup> + v<sub>i</sub><sup>k+1</sup>',
    chartTitle: '粒子功率轨迹',
    runLabel: '运行 PSO',
    population: true,
    tracksBest: true,
    entityPrefix: 'P',
    iterationKey: 'iterations',
  },
  sa: {
    shortName: 'SA',
    title: '模拟退火算法(SA)实现光伏MPPT',
    description: '模拟退火算法以温度控制接受差解的概率，先跳出局部峰值，再随冷却过程逐步收敛。',
    formulaLabelOne: '邻域解与接受概率',
    formulaOne: 'U\' = U + \sigma(T)\,N(0,1), &nbsp; p = min{1, exp[(P(U\') − P(U))/T]}',
    formulaLabelTwo: '冷却过程',
    formulaTwo: 'T(k+1) = \alpha T(k)',
    chartTitle: '退火搜索功率轨迹',
    runLabel: '运行 SA',
    tracksBest: true,
    iterationKey: 'saIterations',
  },
  ga: {
    shortName: 'GA',
    title: '遗传算法(GA)实现光伏MPPT',
    description: '遗传算法将工作电压编码为个体，通过选择、交叉和变异不断提高种群功率。',
    formulaLabelOne: '算术交叉',
    formulaOne: 'U<sub>c</sub> = \lambda U<sub>p1</sub> + (1−\lambda)U<sub>p2</sub>',
    formulaLabelTwo: '高斯变异',
    formulaTwo: 'U\' = U<sub>c</sub> + \sigma N(0,1)',
    chartTitle: '遗传种群功率轨迹',
    runLabel: '运行 GA',
    population: true,
    tracksBest: true,
    entityPrefix: 'G',
    iterationKey: 'gaIterations',
  },
  cs: {
    shortName: 'CS',
    title: '布谷鸟搜索算法(CS)实现光伏MPPT',
    description: '布谷鸟搜索算法利用 Lévy 飞行产生长短步长并存的搜索，同时按发现概率替换较差巢穴。',
    formulaLabelOne: 'Lévy 飞行',
    formulaOne: 'U<sub>i</sub><sup>k+1</sup> = U<sub>i</sub><sup>k</sup> + \alpha \oplus Lévy(\beta)(U<sub>i</sub><sup>k</sup> − U<sub>best</sub>)',
    formulaLabelTwo: '巢穴替换',
    formulaTwo: 'P(replace) = p<sub>a</sub>',
    chartTitle: '巢穴功率轨迹',
    runLabel: '运行 CS',
    population: true,
    tracksBest: true,
    entityPrefix: 'N',
    iterationKey: 'csIterations',
  },
  inc: {
    shortName: 'INC',
    title: '电导增量法(INC)实现光伏MPPT',
    description: '电导增量法通过比较增量电导与瞬时电导，判断工作点位于最大功率点的左侧或右侧。',
    formulaLabelOne: '最大功率点判据',
    formulaOne: 'dP/dU = I + U\,dI/dU = 0 &nbsp; ⇒ &nbsp; dI/dU = −I/U',
    formulaLabelTwo: '电压调整',
    formulaTwo: 'dI/dU &gt; −I/U: U<sub>ref</sub>↑; &nbsp; dI/dU &lt; −I/U: U<sub>ref</sub>↓',
    chartTitle: '电导增量工作点功率',
    runLabel: '运行 INC',
    iterationKey: 'incIterations',
  },
  vinc: {
    shortName: 'VSS-INC',
    title: '变步长电导增量法(VSS-INC)实现光伏MPPT',
    description: '变步长电导增量法根据电导误差及前后两次斜率的变化量衰减补偿，以减小 MPP 附近振荡。',
    formulaLabelOne: '电导滑差',
    formulaOne: 'e(k) = ΔI/ΔU + I/U',
    formulaLabelTwo: '斜率补偿步长',
    formulaTwo: 'ΔU(k) = clamp[ΔU<sub>min</sub> + γ|e(k)|·|e(k)−e(k−1)|, ΔU<sub>min</sub>, ΔU<sub>max</sub>]',
    chartTitle: '变步长 INC 功率轨迹',
    runLabel: '运行 VSS-INC',
    iterationKey: 'vincIterations',
  },
  mpc: {
    shortName: 'MPC',
    title: '模型预测控制(MPC)实现光伏MPPT',
    description: '有限电压集 MPC 利用 Boost 大信号平均模型预测多个候选电压的暂态响应，通过有限时域代价函数选择下一个电压参考。',
    formulaLabelOne: '状态预测',
    formulaOne: 'x(k+j+1) = f<sub>Boost</sub>[x(k+j), U<sub>ref</sub>]',
    formulaLabelTwo: '有限时域代价函数',
    formulaTwo: 'J = −(1/N<sub>p</sub>)Σ P̂<sub>pv</sub>(k+j) / P<sub>GMPP</sub> + λ(ΔU/ΔU<sub>max</sub>)<sup>2</sup>',
    chartTitle: 'MPC 预测功率轨迹',
    runLabel: '运行 MPC',
    tracksBest: true,
    iterationKey: 'mpcIterations',
  },
  fuzzy: {
    shortName: 'FLC',
    title: '模糊控制法(FLC)实现光伏MPPT',
    description: '模糊控制法以功率曲线斜率误差及其变化量为输入，经规则推理生成自适应电压步长。',
    formulaLabelOne: '模糊输入',
    formulaOne: 'E(k) = \Delta P/\Delta U, &nbsp; CE(k) = E(k) − E(k−1)',
    formulaLabelTwo: '去模糊化',
    formulaTwo: '\Delta U = \sum \mu<sub>j</sub>z<sub>j</sub> / \sum \mu<sub>j</sub>',
    chartTitle: '模糊控制工作点功率',
    runLabel: '运行 FLC',
    iterationKey: 'fuzzyIterations',
  },
  nn: {
    shortName: 'BPNN',
    title: 'BP神经网络(BPNN)实现光伏MPPT',
    description: '单隐层 BP 神经网络以三条 P–U/I–U 曲线在固定电压采样点的归一化电流为训练输入，以各工况 GMPP 电压为标签，并通过误差反向传播在浏览器本地完成训练。',
    formulaLabelOne: '前向传播',
    formulaOne: 'h = tanh(W<sub>1</sub>x+b<sub>1</sub>), &nbsp; Û<sub>MPP</sub> = U<sub>oc</sub>·σ(W<sub>2</sub>h+b<sub>2</sub>)',
    formulaLabelTwo: '训练目标',
    formulaTwo: 'L = (1/3)Σ(Û<sub>MPP,j</sub>−U<sub>MPP,j</sub>)<sup>2</sup>',
    chartTitle: 'BP神经网络预测工作点功率',
    runLabel: '运行 BPNN',
    iterationKey: 'nnIterations',
  },
  svr: {
    shortName: 'SVR',
    title: '支持向量回归(SVR)实现光伏MPPT',
    description: '支持向量回归使用 RBF 核建立曲线特征到 GMPP 电压的非线性映射，并通过 ε 不敏感损失限制训练误差。',
    formulaLabelOne: 'RBF 核函数',
    formulaOne: 'K(x<sub>i</sub>,x) = exp(−γ‖x<sub>i</sub>−x‖<sup>2</sup>)',
    formulaLabelTwo: 'ε 不敏感损失',
    formulaTwo: 'L<sub>ε</sub>(y,f) = max(0, |y−f(x)|−ε)',
    chartTitle: 'SVR预测工作点功率',
    runLabel: '运行 SVR',
    iterationKey: 'svrIterations',
  },
  rf: {
    shortName: 'RF',
    title: '随机森林回归(RF)实现光伏MPPT',
    description: '随机森林回归对训练样本进行重复采样，构建多棵随机特征决策树，并对各树预测的 GMPP 电压取平均。',
    formulaLabelOne: '森林回归输出',
    formulaOne: 'Û<sub>MPP</sub> = (1/T) Σ<sub>t=1</sub><sup>T</sup> f<sub>t</sub>(x)',
    formulaLabelTwo: '节点划分准则',
    formulaTwo: 's* = arg min<sub>s</sub> [SSE(D<sub>L</sub>) + SSE(D<sub>R</sub>)]',
    chartTitle: '随机森林预测工作点功率',
    runLabel: '运行 RF',
    iterationKey: 'rfIterations',
  },
  rl: {
    shortName: 'Q-RL',
    title: '强化学习(Q-learning)实现光伏MPPT',
    description: 'Q-learning 智能体将工作电压离散为状态，在降低、保持和升高电压三种动作之间探索，并以归一化光伏功率作为奖励学习三条曲线上的控制策略。',
    formulaLabelOne: 'Q值更新',
    formulaOne: 'Q(s,a) ← Q(s,a) + α[r + γ max<sub>a′</sub>Q(s′,a′) − Q(s,a)]',
    formulaLabelTwo: 'ε-贪婪动作选择',
    formulaTwo: 'a = random &nbsp; with &nbsp; ε; &nbsp; otherwise &nbsp; arg max<sub>a</sub>Q(s,a)',
    chartTitle: '强化学习工作点功率',
    runLabel: '运行 Q-RL',
    iterationKey: 'rlIterations',
  },
  abc: {
    shortName: 'ABC',
    title: '人工蜂群算法(ABC)实现光伏MPPT',
    description: '人工蜂群算法通过雇佣蜂的邻域搜索与侏察蜂的优良解引导，逐个更新候选工作电压。',
    formulaLabelOne: '邻域食源位置',
    formulaOne: 'U′<sub>i</sub> = U<sub>i</sub> + φ<sub>i</sub>(U<sub>i</sub>−U<sub>k</sub>)',
    formulaLabelTwo: '优良解引导',
    formulaTwo: 'U″<sub>i</sub> = U′<sub>i</sub> + ηr(U<sub>best</sub>−U<sub>i</sub>)',
    chartTitle: '蜂群个体功率轨迹',
    runLabel: '运行 ABC',
    population: true,
    tracksBest: true,
    entityPrefix: 'A',
    iterationKey: 'abcIterations',
  },
  afsa: {
    shortName: 'AFSA',
    title: '人工鱼群算法(AFSA)实现光伏MPPT',
    description: '人工鱼群算法使每条人工鱼在感知范围内试探，通过觅食和聚群行为向高功率区域移动。',
    formulaLabelOne: '感知范围',
    formulaOne: 'U<sub>v</sub> = U<sub>i</sub> + Visual · rand(−1,1)',
    formulaLabelTwo: '步进移动',
    formulaTwo: 'U<sub>i</sub><sup>k+1</sup> = U<sub>i</sub><sup>k</sup> + Step · (U<sub>target</sub>−U<sub>i</sub>)/|U<sub>target</sub>−U<sub>i</sub>|',
    chartTitle: '人工鱼个体功率轨迹',
    runLabel: '运行 AFSA',
    population: true,
    tracksBest: true,
    entityPrefix: 'F',
    iterationKey: 'afsaIterations',
  },
  de: {
    shortName: 'DE',
    title: '差分进化算法(DE)实现光伏MPPT',
    description: '差分进化算法利用多个工作电压之间的差分构造候选解，并以贪婪选择逐个更新种群。',
    formulaLabelOne: '差分变异',
    formulaOne: 'V<sub>i</sub> = U<sub>r1</sub> + F(U<sub>r2</sub>−U<sub>r3</sub>)',
    formulaLabelTwo: '交叉与贪婪选择',
    formulaTwo: 'U′<sub>i</sub> = V<sub>i</sub> &nbsp; if &nbsp; r &lt; CR; &nbsp; keep U′<sub>i</sub> if P(U′<sub>i</sub>) ≥ P(U<sub>i</sub>)',
    chartTitle: '差分进化个体功率轨迹',
    runLabel: '运行 DE',
    population: true,
    tracksBest: true,
    entityPrefix: 'D',
    iterationKey: 'deIterations',
  },
  dqn: { shortName: 'DQN', title: '深度Q网络(DQN)实现光伏MPPT', description: '本地教学演示以轻量化函数近似器表示离散电压动作的 Q 值，并用 ε-贪婪决策展示 DQN 的 MPPT 控制逻辑；不复现论文训练规模。', formulaLabelOne: '时序差分目标', formulaOne: 'y = r + γ max<sub>a′</sub>Q<sub>target</sub>(s′,a′)', formulaLabelTwo: '网络损失', formulaTwo: 'L(θ)=E[(y−Q(s,a;θ))<sup>2</sup>]', chartTitle: 'DQN 功率轨迹', runLabel: '运行 DQN', tracksBest: true, iterationKey: 'dqnIterations' },
  sac: { shortName: 'SAC', title: 'Soft Actor-Critic(SAC)实现光伏MPPT', description: '本地教学演示以轻量化连续策略近似 SAC 的功率寻优与熵探索权衡；不复现论文中的完整双 Q 网络和离线训练规模。', formulaLabelOne: '软状态值目标', formulaOne: 'y = r + γ[Q<sub>target</sub>(s′,a′) − α log π(a′|s′)]', formulaLabelTwo: '连续策略动作', formulaTwo: 'ΔU = ΔU<sub>max</sub> tanh(μ(s)+σ(s)ε)', chartTitle: 'SAC 连续控制功率轨迹', runLabel: '运行 SAC', tracksBest: true, iterationKey: 'sacIterations' },
  pso_po: { shortName: 'PSO+P&O', title: '粒子群+P&O混合算法实现光伏MPPT', description: '先由 PSO 在多峰 P–U 曲线上定位高质量区域，再切换到小步长 P&O 完成局部跟踪并降低稳态振荡。', formulaLabelOne: '全局搜索', formulaOne: 'v<sub>i</sub>←wv<sub>i</sub>+c<sub>1</sub>r<sub>1</sub>(pbest<sub>i</sub>−x<sub>i</sub>)+c<sub>2</sub>r<sub>2</sub>(gbest−x<sub>i</sub>)', formulaLabelTwo: '局部精修', formulaTwo: 'U<sub>ref</sub>(k+1)=U<sub>ref</sub>(k)+ΔU<sub>PO</sub>·sgn(ΔPΔU)', chartTitle: 'PSO+P&O 功率轨迹', runLabel: '运行 PSO+P&O', population: true, tracksBest: true, iterationKey: 'psoPoIterations' },
  ga_po: { shortName: 'GA+P&O', title: '遗传算法+P&O混合算法实现光伏MPPT', description: '遗传算法先执行全局种群搜索，随后把最优个体交给 P&O 进行局部精细跟踪。', formulaLabelOne: '遗传全局搜索', formulaOne: 'U<sub>c</sub>=λU<sub>p1</sub>+(1−λ)U<sub>p2</sub>+mutation', formulaLabelTwo: 'P&O 局部搜索', formulaTwo: 'U<sub>ref</sub>(k+1)=U<sub>ref</sub>(k)+ΔU<sub>PO</sub>·sgn(ΔPΔU)', chartTitle: 'GA+P&O 功率轨迹', runLabel: '运行 GA+P&O', population: true, tracksBest: true, iterationKey: 'gaPoIterations' },
  ga_fuzzy: { shortName: 'GA+FLC', title: '遗传算法+模糊控制实现光伏MPPT', description: 'GA 优化模糊控制器的尺度与搜索起点，在线模糊推理再根据功率斜率及其变化量生成连续电压修正。', formulaLabelOne: 'GA 参数优化', formulaOne: '(K<sub>e</sub>,K<sub>ce</sub>,K<sub>u</sub>)* = arg max η<sub>MPPT</sub>', formulaLabelTwo: '模糊控制输出', formulaTwo: 'ΔU = Σ μ<sub>j</sub>z<sub>j</sub>/Σ μ<sub>j</sub>', chartTitle: 'GA+模糊控制功率轨迹', runLabel: '运行 GA+FLC', population: true, tracksBest: true, iterationKey: 'gaFuzzyIterations' },
  ga_ann: { shortName: 'GA-ANN', title: '遗传算法优化人工神经网络(GA-ANN)实现光伏MPPT', description: 'GA 优化 ANN 结构与候选工作区，ANN 学习已采样工作点并给出最大功率电压引导。本页按论文机制制作教学仿真，并非论文离线网络的逐参数复现。', formulaLabelOne: 'GA 优化 ANN', formulaOne: 'θ* = arg min<sub>θ∈GA</sub> RMSE(V<sub>MPP</sub>, f<sub>ANN</sub>(G,T;θ))', formulaLabelTwo: 'ANN 引导搜索', formulaTwo: 'U<sub>i</sub>←(1−λ)U<sub>GA,i</sub>+λÛ<sub>ANN</sub>', chartTitle: 'GA-ANN 混合搜索功率轨迹', runLabel: '运行 GA-ANN', population: true, tracksBest: true, entityPrefix: '个体', iterationKey: 'gaAnnIterations' },
};

const algorithmGroups = {
  traditional: ['po', 'hc', 'vpo', 'cvt', 'focv', 'scan', 'esc', 'inc', 'vinc', 'jeinc', 'mpc'],
  fuzzy_logic: ['fuzzy'],
  metaheuristic: ['pso', 'sa', 'ga', 'cs', 'abc', 'afsa', 'de'],
  machine_learning: ['nn', 'svr', 'rf', 'rl', 'dqn', 'sac'],
  hybrid: ['pso_po', 'ga_po', 'ga_fuzzy', 'ga_ann'],
};

const algorithmLabels = {
  po: '扰动观察法 (P&O)',
  hc: '爬山法 (HC)',
  vpo: '变步长扰动观察法 (VSS-P&O)',
  cvt: '固定电压法 (CVT)',
  focv: '开路电压法 (FOCV)',
  scan: '电压扫描法 (VS)',
  esc: '极值搜索控制 (ESC)',
  inc: '电导增量法 (INC)',
  vinc: '变步长电导增量法 (VSS-INC)',
  jeinc: '跃变探索式电导增量法 (JEINC)',
  mpc: '模型预测控制 (MPC)',
  pso: '粒子群算法 (PSO)',
  sa: '模拟退火算法 (SA)',
  ga: '遗传算法 (GA)',
  cs: '布谷鸟搜索算法 (CS)',
  abc: '人工蜂群算法 (ABC)',
  afsa: '人工鱼群算法 (AFSA)',
  de: '差分进化算法 (DE)',
  dqn: '深度Q网络 (DQN)', sac: 'Soft Actor-Critic (SAC)',
  pso_po: '粒子群 + P&O', ga_po: '遗传算法 + P&O', ga_fuzzy: '遗传算法 + 模糊控制', ga_ann: '遗传算法优化人工神经网络 (GA-ANN)',
  fuzzy: '模糊控制法 (FLC)',
  nn: 'BP神经网络 (BPNN)',
  svr: '支持向量回归 (SVR)',
  rf: '随机森林回归 (RF)',
  rl: 'Q-learning',
};

const algorithmLabelsEn = {
  po: 'Perturb and Observe (P&O)',
  hc: 'Hill Climbing (HC)',
  vpo: 'Variable-Step P&O (VSS-P&O)',
  cvt: 'Constant Voltage Tracking (CVT)',
  focv: 'Fractional Open-Circuit Voltage (FOCV)',
  scan: 'Voltage Scan (VS)',
  esc: 'Extremum-Seeking Control (ESC)',
  inc: 'Incremental Conductance (INC)',
  vinc: 'Variable-Step INC (VSS-INC)',
  jeinc: 'Jump-Exploration INC (JEINC)',
  mpc: 'Model Predictive Control (MPC)',
  pso: 'Particle Swarm Optimization (PSO)',
  sa: 'Simulated Annealing (SA)',
  ga: 'Genetic Algorithm (GA)',
  cs: 'Cuckoo Search (CS)',
  abc: 'Artificial Bee Colony (ABC)',
  afsa: 'Artificial Fish Swarm Algorithm (AFSA)',
  de: 'Differential Evolution (DE)',
  dqn: 'Deep Q-Network (DQN)',
  sac: 'Soft Actor-Critic (SAC)',
  pso_po: 'Particle Swarm + P&O',
  ga_po: 'Genetic Algorithm + P&O',
  ga_fuzzy: 'Genetic Algorithm + Fuzzy Control',
  ga_ann: 'GA-Optimized Artificial Neural Network (GA-ANN)',
  fuzzy: 'Fuzzy Logic Control (FLC)',
  nn: 'Backpropagation Neural Network (BPNN)',
  svr: 'Support Vector Regression (SVR)',
  rf: 'Random Forest Regression (RF)',
  rl: 'Q-learning',
};

const parameterGuideUi = {
  zh: {
    titleSuffix: '参数说明',
    definition: '定义',
    increase: '增大时',
    decrease: '减小时',
    random: '随机分布',
    uniform: '均匀分布',
    close: '关闭参数解释',
    references: '参考文献',
    disclaimer: '提示：参数之间存在耦合，单独改变某一参数得到的趋势不一定在所有取值范围内保持不变。建议每次只改变一个参数，并比较收敛速度、稳态振荡和是否到达 GMPP。',
  },
  en: {
    titleSuffix: 'Parameter Guide',
    definition: 'Definition',
    increase: 'If increased',
    decrease: 'If decreased',
    random: 'Random',
    uniform: 'Uniform',
    close: 'Close parameter guide',
    references: 'References',
    disclaimer: 'Note: Parameters are coupled, so a one-parameter trend may not hold over the entire range. Change one parameter at a time and compare convergence speed, steady-state oscillation, and whether the GMPP is reached.',
  },
};

const parameterGuideReferences = {
  po: [
    { citation: 'T. Esram and P. L. Chapman, “Comparison of photovoltaic array maximum power point tracking techniques,” IEEE Trans. Energy Convers., vol. 22, no. 2, pp. 439–449, Jun. 2007, doi: 10.1109/TEC.2006.874230.', url: 'https://doi.org/10.1109/TEC.2006.874230' },
    { citation: 'N. Femia, G. Petrone, G. Spagnuolo, and M. Vitelli, “Optimization of perturb and observe maximum power point tracking method,” IEEE Trans. Power Electron., vol. 20, no. 4, pp. 963–973, Jul. 2005, doi: 10.1109/TPEL.2005.850975.', url: 'https://doi.org/10.1109/TPEL.2005.850975' },
  ],
  hc: [
    { citation: 'T. Esram and P. L. Chapman, “Comparison of photovoltaic array maximum power point tracking techniques,” IEEE Trans. Energy Convers., vol. 22, no. 2, pp. 439–449, Jun. 2007, doi: 10.1109/TEC.2006.874230.', url: 'https://doi.org/10.1109/TEC.2006.874230' },
  ],
  vpo: [
    { citation: 'F. A. O. Aashoor and F. V. P. Robinson, “A variable step size perturb and observe algorithm for photovoltaic maximum power point tracking,” in Proc. 47th Int. Universities Power Engineering Conf. (UPEC), London, U.K., 2012, pp. 1–6, doi: 10.1109/UPEC.2012.6398612.', url: 'https://doi.org/10.1109/UPEC.2012.6398612' },
    { citation: 'N. Femia, G. Petrone, G. Spagnuolo, and M. Vitelli, “Optimization of perturb and observe maximum power point tracking method,” IEEE Trans. Power Electron., vol. 20, no. 4, pp. 963–973, Jul. 2005, doi: 10.1109/TPEL.2005.850975.', url: 'https://doi.org/10.1109/TPEL.2005.850975' },
  ],
  cvt: [
    { citation: 'T. Esram and P. L. Chapman, “Comparison of photovoltaic array maximum power point tracking techniques,” IEEE Trans. Energy Convers., vol. 22, no. 2, pp. 439–449, Jun. 2007, doi: 10.1109/TEC.2006.874230.', url: 'https://doi.org/10.1109/TEC.2006.874230' },
  ],
  focv: [
    { citation: 'T. Esram and P. L. Chapman, “Comparison of photovoltaic array maximum power point tracking techniques,” IEEE Trans. Energy Convers., vol. 22, no. 2, pp. 439–449, Jun. 2007, doi: 10.1109/TEC.2006.874230.', url: 'https://doi.org/10.1109/TEC.2006.874230' },
  ],
  scan: [
    { citation: 'H. Patel and V. Agarwal, “Maximum power point tracking scheme for PV systems operating under partially shaded conditions,” IEEE Trans. Ind. Electron., vol. 55, no. 4, pp. 1689–1698, Apr. 2008, doi: 10.1109/TIE.2008.917118.', url: 'https://doi.org/10.1109/TIE.2008.917118' },
  ],
  esc: [
    { citation: 'R. Leyva, C. Alonso, I. Queinnec, A. Cid-Pastor, D. Lagrange, and L. Martínez-Salamero, “MPPT of photovoltaic systems using extremum-seeking control,” IEEE Trans. Aerosp. Electron. Syst., vol. 42, no. 1, pp. 249–258, Jan. 2006, doi: 10.1109/TAES.2006.1603420.', url: 'https://doi.org/10.1109/TAES.2006.1603420' },
  ],
  inc: [
    { citation: 'T. Esram and P. L. Chapman, “Comparison of photovoltaic array maximum power point tracking techniques,” IEEE Trans. Energy Convers., vol. 22, no. 2, pp. 439–449, Jun. 2007, doi: 10.1109/TEC.2006.874230.', url: 'https://doi.org/10.1109/TEC.2006.874230' },
    { citation: 'F. Liu, S. Duan, F. Liu, B. Liu, and Y. Kang, “A variable step size INC MPPT method for PV systems,” IEEE Trans. Ind. Electron., vol. 55, no. 7, pp. 2622–2628, Jul. 2008, doi: 10.1109/TIE.2008.920550.', url: 'https://doi.org/10.1109/TIE.2008.920550' },
  ],
  vinc: [
    { citation: 'F. Liu, S. Duan, F. Liu, B. Liu, and Y. Kang, “A variable step size INC MPPT method for PV systems,” IEEE Trans. Ind. Electron., vol. 55, no. 7, pp. 2622–2628, Jul. 2008, doi: 10.1109/TIE.2008.920550.', url: 'https://doi.org/10.1109/TIE.2008.920550' },
  ],
  jeinc: [
    { citation: '王艺博, 苏高民, and 邱榕鑫, “基于跃变探索式电导增量法的光伏阵列全局最大功率点跟踪控制研究,” 电气工程学报, vol. 19, no. 1, pp. 351–357, Mar. 2024, doi: 10.11985/2024.01.038.', url: './assets/references/jeinc-2024.pdf' },
  ],
  mpc: [
    { citation: 'S. Kouro, P. Cortés, R. Vargas, U. Ammann, and J. Rodríguez, “Model predictive control—A simple and powerful method to control power converters,” IEEE Trans. Ind. Electron., vol. 56, no. 6, pp. 1826–1838, Jun. 2009, doi: 10.1109/TIE.2008.2008349.', url: 'https://doi.org/10.1109/TIE.2008.2008349' },
  ],
  fuzzy: [
    { citation: 'R. Rahmani, M. Seyedmahmoudian, S. Mekhilef, and R. Yusof, “Implementation of fuzzy logic maximum power point tracking controller for photovoltaic system,” Am. J. Appl. Sci., vol. 10, no. 3, pp. 209–218, 2013, doi: 10.3844/ajassp.2013.209.218.', url: 'https://doi.org/10.3844/ajassp.2013.209.218' },
  ],
  pso: [
    { citation: 'Y.-H. Liu, S.-C. Huang, J.-W. Huang, and W.-C. Liang, “A particle swarm optimization-based maximum power point tracking algorithm for PV systems operating under partially shaded conditions,” IEEE Trans. Energy Convers., vol. 27, no. 4, pp. 1027–1035, Dec. 2012, doi: 10.1109/TEC.2012.2219533.', url: 'https://doi.org/10.1109/TEC.2012.2219533' },
    { citation: 'J. Kennedy and R. Eberhart, “Particle swarm optimization,” in Proc. IEEE Int. Conf. Neural Networks, Perth, WA, Australia, 1995, vol. 4, pp. 1942–1948, doi: 10.1109/ICNN.1995.488968.', url: 'https://doi.org/10.1109/ICNN.1995.488968' },
  ],
  sa: [
    { citation: 'S. Kirkpatrick, C. D. Gelatt, Jr., and M. P. Vecchi, “Optimization by simulated annealing,” Science, vol. 220, no. 4598, pp. 671–680, May 1983, doi: 10.1126/science.220.4598.671.', url: 'https://doi.org/10.1126/science.220.4598.671' },
  ],
  ga: [
    { citation: 'D. Whitley, “A genetic algorithm tutorial,” Stat. Comput., vol. 4, no. 2, pp. 65–85, Jun. 1994, doi: 10.1007/BF00175354.', url: 'https://doi.org/10.1007/BF00175354' },
  ],
  cs: [
    { citation: 'X.-S. Yang and S. Deb, “Cuckoo search via Lévy flights,” in Proc. 2009 World Congress on Nature & Biologically Inspired Computing (NaBIC), Coimbatore, India, 2009, pp. 210–214, doi: 10.1109/NABIC.2009.5393690.', url: 'https://doi.org/10.1109/NABIC.2009.5393690' },
  ],
  abc: [
    { citation: 'D. Karaboga and B. Basturk, “A powerful and efficient algorithm for numerical function optimization: Artificial bee colony (ABC) algorithm,” J. Global Optim., vol. 39, no. 3, pp. 459–471, Nov. 2007, doi: 10.1007/s10898-007-9149-x.', url: 'https://doi.org/10.1007/s10898-007-9149-x' },
  ],
  afsa: [
    { citation: 'X. L. Li, Z. J. Shao, and J. X. Qian, “An optimizing method based on autonomous animats: Fish-swarm algorithm,” Syst. Eng.—Theory Pract., vol. 22, no. 11, pp. 32–38, Nov. 2002, doi: 10.12011/1000-6788(2002)11-32.', url: 'https://doi.org/10.12011/1000-6788(2002)11-32' },
  ],
  de: [
    { citation: 'R. Storn and K. Price, “Differential evolution—A simple and efficient heuristic for global optimization over continuous spaces,” J. Global Optim., vol. 11, no. 4, pp. 341–359, Dec. 1997, doi: 10.1023/A:1008202821328.', url: 'https://doi.org/10.1023/A:1008202821328' },
  ],
  nn: [
    { citation: 'D. E. Rumelhart, G. E. Hinton, and R. J. Williams, “Learning representations by back-propagating errors,” Nature, vol. 323, no. 6088, pp. 533–536, Oct. 1986, doi: 10.1038/323533a0.', url: 'https://doi.org/10.1038/323533a0' },
  ],
  svr: [
    { citation: 'A. J. Smola and B. Schölkopf, “A tutorial on support vector regression,” Stat. Comput., vol. 14, no. 3, pp. 199–222, Aug. 2004, doi: 10.1023/B:STCO.0000035301.49549.88.', url: 'https://doi.org/10.1023/B:STCO.0000035301.49549.88' },
  ],
  rf: [
    { citation: 'L. Breiman, “Random forests,” Mach. Learn., vol. 45, no. 1, pp. 5–32, Oct. 2001, doi: 10.1023/A:1010933404324.', url: 'https://doi.org/10.1023/A:1010933404324' },
  ],
  rl: [
    { citation: 'C. J. C. H. Watkins and P. Dayan, “Q-learning,” Mach. Learn., vol. 8, nos. 3–4, pp. 279–292, May 1992, doi: 10.1007/BF00992698.', url: 'https://doi.org/10.1007/BF00992698' },
  ],
  dqn: [{ citation: 'F. R. Jiménez et al., “Deep reinforcement learning using deep-Q-network for global maximum power point tracking: Design and experiments in real photovoltaic systems,” Heliyon, vol. 10, no. 21, Art. no. e37974, Nov. 2024, doi: 10.1016/j.heliyon.2024.e37974.', url: 'https://doi.org/10.1016/j.heliyon.2024.e37974' }],
  sac: [{ citation: 'S. E. Nwachukwu, K. A. Folly, and K. O. Awodele, “Soft actor-critic-based MPPT control of solar PV systems under partial shading conditions,” IEEE Open Access J. Power Energy, vol. 12, pp. 194–208, 2025, doi: 10.1109/OAJPE.2025.3560626.', url: 'https://doi.org/10.1109/OAJPE.2025.3560626' }],
  pso_po: [{ citation: 'M. A. M. Ramli et al., “A modified particle swarm optimization for efficient maximum power point tracking under partial shading condition,” IEEE Trans. Sustain. Energy, vol. 14, no. 3, pp. 1822–1834, Jul. 2023, doi: 10.1109/TSTE.2023.3250710.', url: 'https://doi.org/10.1109/TSTE.2023.3250710' }],
  ga_po: [{ citation: 'S. Daraban, D. Petreus, and C. Morel, “A novel MPPT algorithm based on a modified genetic algorithm specialized on tracking the global maximum power point in photovoltaic systems affected by partial shading,” Energy, vol. 74, pp. 374–388, Sep. 2014, doi: 10.1016/j.energy.2014.07.001.', url: 'https://doi.org/10.1016/j.energy.2014.07.001' }],
  ga_fuzzy: [{ citation: 'C. Larbes, S. M. Aït Cheikh, T. Obeidi, and A. Zerguerras, “Genetic algorithms optimized fuzzy logic control for the maximum power point tracking in photovoltaic system,” Renew. Energy, vol. 34, no. 10, pp. 2093–2100, Oct. 2009, doi: 10.1016/j.renene.2009.01.006.', url: 'https://doi.org/10.1016/j.renene.2009.01.006' }],
  ga_ann: [{ citation: 'M. N. Ali, K. Mahmoud, M. Lehtonen, and M. M. F. Darwish, “Promising MPPT methods combining metaheuristic, fuzzy-logic and ANN techniques for grid-connected photovoltaic,” Sensors, vol. 21, no. 4, Art. no. 1244, Feb. 2021, doi: 10.3390/s21041244.', url: 'https://doi.org/10.3390/s21041244' }],
};

const parameterGuideProfiles = {
  populationSize: {
    zh: ['并行候选工作点（个体）的数量。', '覆盖搜索空间的机会增加、结果通常更稳健，但完成一轮群体更新需要更多采样。', '计算与采样更快，但多峰曲线上漏掉全局峰值的风险上升。'],
    en: ['Number of candidate operating points in the population.', 'Usually improves search-space coverage and robustness, but a full population cycle needs more samples.', 'Reduces sampling and computation, but increases the risk of missing the global peak on a multimodal curve.'],
  },
  maxVelocity: {
    zh: ['限制单次算法更新允许的最大电压变化量，以开路电压范围的百分比表示。', '移动更快、越过局部峰的能力增强，但超调、振荡和暂态功率损失可能增大。', '轨迹更平滑、局部精度更高，但收敛变慢且更难跨越相邻峰谷。'],
    en: ['Limits the largest voltage-reference change in one algorithm update, expressed as a percentage of the open-circuit-voltage range.', 'Speeds up motion and helps cross local valleys, but may increase overshoot, oscillation, and transient power loss.', 'Produces smoother and more precise local motion, but slows convergence and makes peak-to-peak travel harder.'],
  },
  initialDistribution: {
    mode: 'choice',
    zh: ['规定群体算法在第一次迭代前如何布置候选工作点。', '每次运行生成不同位置，可能更快碰到优质区域，但重复实验的轨迹与结果离散性更大。', '在整个电压范围等间距布点，覆盖稳定且便于复现实验，但可能缺少随机探索优势。'],
    en: ['Controls how candidate operating points are placed before the first population update.', 'Generates different positions on each run and may hit a promising region early, but repeatability is lower.', 'Spaces candidates evenly across the voltage range for reproducible coverage, but removes the benefit of random exploration.'],
  },
  fixedVoltageStep: {
    zh: ['每次搜索更新施加的固定电压增量。', '到达峰值附近更快，但稳态振荡和越过窄峰的概率增大。', '稳态功率波动更小、定位更细，但跟踪速度下降。'],
    en: ['Fixed voltage increment applied at each search update.', 'Reaches a peak faster, but increases steady-state oscillation and the chance of stepping over a narrow peak.', 'Improves local resolution and reduces power ripple, but slows tracking.'],
  },
  minimumStep: {
    zh: ['自适应步长收缩后仍允许的最小电压移动量。', '避免停滞并提高持续响应速度，但峰值附近振荡更明显。', '可提高最终定位精度；过小或为零时可能提前停在近似峰值处。'],
    en: ['Smallest voltage movement allowed after the adaptive step contracts.', 'Prevents stagnation and preserves responsiveness, but increases oscillation near the peak.', 'Can improve final precision; if too small or zero, the search may stop at an approximate peak.'],
  },
  maximumStep: {
    zh: ['自适应搜索在误差较大时允许使用的最大电压步长。', '远离 MPP 时收敛更快，但可能产生较大超调并跨过窄峰。', '搜索更平稳，但跨越宽电压范围所需迭代数增加。'],
    en: ['Largest voltage step available to an adaptive search when the error is large.', 'Accelerates motion far from the MPP, but may cause overshoot or skip a narrow peak.', 'Makes the search smoother, but requires more iterations to cover a wide voltage range.'],
  },
  tolerance: {
    zh: ['把工作点判定为接近 MPP 的电导误差容许范围。', '更早停止调节、抑制噪声与振荡，但可能留下较大的稳态偏差。', '判定更严格、理论精度更高，但对噪声更敏感并可能持续摆动。'],
    en: ['Conductance-error band within which the operating point is treated as being near the MPP.', 'Stops adjustment earlier and suppresses noise and oscillation, but may leave a larger steady-state error.', 'Tightens the MPP criterion and can improve accuracy, but increases noise sensitivity and hunting.'],
  },
  particleCount: {
    zh: ['参与 PSO 搜索的粒子数量，每个粒子代表一个候选电压。', '全局覆盖和抗初值能力增强，但一轮更新耗时更长。', '运行更快，但群体多样性下降，更容易停在局部峰。'],
    en: ['Number of PSO particles, each representing a candidate voltage.', 'Improves global coverage and robustness to initialization, but lengthens each population cycle.', 'Runs faster, but reduces diversity and increases the chance of local-peak trapping.'],
  },
  inertia: {
    zh: ['保留粒子上一时刻速度的权重，决定运动惯性。', '增强全局探索和跨峰能力，但可能导致振荡或越界。', '运动阻尼更强、局部收敛更稳，但可能过早收敛。'],
    en: ['Weight applied to the particle’s previous velocity.', 'Strengthens global exploration and peak crossing, but may cause oscillation or boundary hits.', 'Adds damping and stabilizes local convergence, but can cause premature convergence.'],
  },
  cognitive: {
    zh: ['粒子向自身历史最优位置靠拢的强度。', '个体经验影响增强、搜索更分散，但群体协同可能变弱并产生振荡。', '个体记忆作用减弱，轨迹更多由惯性和全局最优支配。'],
    en: ['Strength with which a particle is attracted to its personal-best position.', 'Emphasizes individual experience and diversity, but may weaken coordination and increase oscillation.', 'Reduces personal-memory influence, leaving motion more dependent on inertia and the global best.'],
  },
  social: {
    zh: ['粒子向群体全局最优位置靠拢的强度。', '发现优质点后群体聚集更快，但容易早熟收敛到局部峰。', '保留更多群体多样性，但收敛速度可能下降。'],
    en: ['Strength with which particles are attracted to the swarm’s global-best position.', 'Makes the swarm gather faster after a good point is found, but increases premature convergence risk.', 'Preserves diversity, but can slow convergence.'],
  },
  deadband: {
    zh: ['两次采样功率差小于该值时不改变爬山方向的功率阈值。', '抗测量噪声更强、抖动减少，但可能在峰值附近较早停止。', '对细小功率变化更敏感、定位更精细，但噪声可能频繁触发换向。'],
    en: ['Power-change threshold below which the hill-climbing direction is not changed.', 'Improves noise immunity and reduces chatter, but may stop farther from the true peak.', 'Responds to smaller power changes and can refine the peak, but noise may trigger frequent reversals.'],
  },
  slopeGain: {
    zh: ['把 P–U 斜率误差转换为自适应扰动步长的比例系数。', '斜率相同时步长更大、响应更快，但峰值附近更容易超调。', '调节更柔和、振荡减小，但远离 MPP 时收敛较慢。'],
    en: ['Gain that converts P–U slope information into an adaptive perturbation step.', 'Produces a larger step for the same slope and faster response, but more overshoot near the peak.', 'Softens the adjustment and reduces oscillation, but slows convergence far from the MPP.'],
  },
  jumpDepth: {
    zh: ['JEINC 完成局部搜索后用于跨越当前峰谷的电压跃变量。', '更容易跳出宽局部峰并探索远处区域，但可能越过相邻有效峰或造成较大功率跌落。', '跃变暂态较小，但可能无法越过局部峰附近的低谷。'],
    en: ['Voltage jump used by JEINC to leave a locally optimized region and explore beyond it.', 'Helps cross wide local peaks and valleys, but may skip useful nearby peaks or cause a larger power dip.', 'Reduces jump transients, but may fail to escape the local-peak region.'],
  },
  jumpCount: {
    zh: ['JEINC 在一次全局探索阶段允许执行的最大跃变次数。', '可检查更多潜在峰值、提高找到 GMPP 的机会，但搜索时间和暂态次数增加。', '更快结束探索，但可能尚未覆盖全部峰值区域。'],
    en: ['Maximum number of jump explorations allowed in one JEINC search.', 'Checks more potential peaks and improves GMPP discovery probability, but adds search time and transients.', 'Ends exploration sooner, but may leave some peak regions unvisited.'],
  },
  cvtReference: {
    zh: ['CVT 直接跟踪的固定电压参考值。', '工作点整体向 P–U 曲线高电压侧移动。', '工作点整体向低电压侧移动；只有参考值接近实际 MPP 电压时功率才会较高。'],
    en: ['Fixed voltage reference directly tracked by CVT.', 'Moves the operating point toward the higher-voltage side of the P–U curve.', 'Moves it toward the lower-voltage side; high power is obtained only when the reference is close to the actual MPP voltage.'],
  },
  focvRatio: {
    zh: ['把测得开路电压换算为 MPP 电压参考的经验比例系数。', '参考点向高电压侧移动，可能适合高 Vmpp/Voc 工况。', '参考点向低电压侧移动；比例偏离真实关系会产生固定跟踪误差。'],
    en: ['Empirical ratio used to convert measured open-circuit voltage into an MPP-voltage reference.', 'Moves the reference toward higher voltage and may suit conditions with a high Vmpp/Voc ratio.', 'Moves the reference lower; any mismatch from the true ratio creates a fixed tracking error.'],
  },
  samplePeriod: {
    zh: ['FOCV 两次开路电压采样之间的算法更新次数。', '减少开路采样与功率中断，但辐照变化后参考电压更新更慢。', '更及时适应工况变化，但开路采样更频繁、功率损失与扰动增加。'],
    en: ['Number of algorithm updates between open-circuit-voltage samples in FOCV.', 'Reduces sampling interruptions and associated power loss, but updates more slowly after irradiance changes.', 'Adapts faster to changing conditions, but causes more frequent open-circuit interruptions.'],
  },
  scanHold: {
    zh: ['电压扫描中每个候选电压保持并采样的更新周期数。', '给 Boost 暂态更多建立时间、测量更可靠，但完整扫描耗时增加。', '扫描更快，但可能在功率尚未稳定时采样，导致峰值判断误差。'],
    en: ['Number of update periods for which each candidate voltage is held during a voltage scan.', 'Allows more settling time and more reliable power measurement, but lengthens the full scan.', 'Speeds up the scan, but may sample before the Boost transient settles.'],
  },
  ditherAmplitude: {
    zh: ['ESC 叠加在平均电压参考上的周期性微扰幅值。', '梯度信号更易辨识、收敛可能加快，但功率纹波与偏离峰值的幅度增加。', '稳态纹波减小，但梯度估计信噪比下降、收敛可能变慢。'],
    en: ['Amplitude of the periodic dither superimposed on the mean voltage reference in ESC.', 'Improves gradient observability and may accelerate convergence, but increases power ripple and peak deviation.', 'Reduces steady-state ripple, but weakens the gradient signal and may slow convergence.'],
  },
  integralGain: {
    zh: ['ESC 将解调后的梯度估计积分为平均电压变化的增益。', '平均工作点移动更快，但可能放大噪声并产生振荡。', '控制更平稳、抗噪性更好，但跟踪速度下降。'],
    en: ['Gain that integrates the demodulated gradient estimate into movement of the mean voltage.', 'Moves the mean operating point faster, but can amplify noise and cause oscillation.', 'Makes control smoother and more noise tolerant, but slows tracking.'],
  },
  ditherPeriod: {
    zh: ['完成一个 ESC 扰动周期所需的算法更新次数。', '扰动频率降低、每周期采样更充分，但梯度更新更慢。', '梯度刷新更快，但周期采样不足时估计可能受暂态和噪声影响。'],
    en: ['Number of algorithm updates used for one ESC dither cycle.', 'Lowers dither frequency and provides more samples per cycle, but slows gradient updates.', 'Refreshes the gradient faster, but insufficient samples may make the estimate sensitive to transients and noise.'],
  },
  temperature: {
    zh: ['模拟退火开始时接受较差解的热度尺度。', '更容易跳出局部峰、全局探索更强，但早期功率波动和收敛时间增加。', '更快趋于贪婪搜索，但更容易被局部峰困住。'],
    en: ['Initial thermal scale controlling acceptance of inferior solutions in simulated annealing.', 'Strengthens global exploration and escape from local peaks, but increases early power fluctuation and convergence time.', 'Makes the search greedy sooner, but increases local-peak trapping risk.'],
  },
  cooling: {
    zh: ['每次更新后保留的温度比例，越接近 1 降温越慢。', '维持随机探索更久、全局性增强，但收敛变慢。', '更快转入局部精细搜索，但可能在充分探索前冻结。'],
    en: ['Fraction of temperature retained after each update; values closer to 1 cool more slowly.', 'Maintains exploration longer and improves global search, but slows convergence.', 'Enters local refinement sooner, but may freeze before adequate exploration.'],
  },
  neighborhoodStep: {
    zh: ['模拟退火从当前电压生成邻域候选点的尺度。', '探索跨度增大、越过峰谷更容易，但接受率和局部精度可能下降。', '局部搜索更细致，但远距离探索能力减弱。'],
    en: ['Scale used to generate a neighboring voltage candidate in simulated annealing.', 'Expands exploration and valley crossing, but may reduce acceptance rate and local precision.', 'Improves local refinement, but weakens long-range exploration.'],
  },
  crossover: {
    zh: ['遗传算法中个体参与重组产生新候选电压的概率。', '信息交换更频繁、组合搜索加快，但优秀结构可能被过度打散。', '保留父代特征更多，但产生新组合的速度下降。'],
    en: ['Probability that genetic-algorithm individuals recombine to create new candidate voltages.', 'Increases information exchange and recombination, but may disrupt good structures too often.', 'Preserves parent traits, but generates new combinations more slowly.'],
  },
  mutation: {
    zh: ['遗传算法中个体发生随机电压变化的概率。', '多样性和跳出局部峰能力增强，但收敛后仍可能反复偏离优点。', '轨迹更稳定，但种群容易失去多样性并早熟收敛。'],
    en: ['Probability that a genetic-algorithm individual receives a random voltage change.', 'Improves diversity and local-peak escape, but can keep disturbing good solutions after convergence.', 'Stabilizes the population, but increases premature convergence risk.'],
  },
  mutationSpan: {
    zh: ['一次变异可覆盖的电压范围，占搜索空间的百分比。', '能跨越更宽峰谷，但变异后的功率跌落和搜索随机性增大。', '适合局部微调，但难以从远离 GMPP 的区域跳出。'],
    en: ['Voltage range covered by one mutation, as a percentage of the search space.', 'Crosses wider valleys, but causes larger power dips and more randomness.', 'Supports local refinement, but makes escape from distant local peaks harder.'],
  },
  levyScale: {
    zh: ['布谷鸟搜索中 Lévy 飞行步长相对于电压范围的尺度。', '长距离探索和跨峰能力增强，但候选点跳动与边界截断增加。', '搜索更局部、更平稳，但可能困在当前峰附近。'],
    en: ['Scale of Lévy-flight steps relative to the voltage range in Cuckoo Search.', 'Strengthens long-range exploration and peak crossing, but increases jumps and boundary clipping.', 'Makes motion more local and stable, but may trap nests near the current peak.'],
  },
  discovery: {
    zh: ['巢穴被发现并用新随机候选点替换的概率。', '持续注入多样性、利于跳出局部峰，但收敛后仍会出现新跳点。', '群体更稳定；设为 0 可避免随机重启，但全局探索能力降低。'],
    en: ['Probability that a nest is discovered and replaced by a new random candidate.', 'Continually injects diversity and aids local-peak escape, but creates new jumps even after convergence.', 'Stabilizes the population; setting it to zero prevents random restarts but weakens global exploration.'],
  },
  compensation: {
    zh: ['根据前后斜率变化调节 VSS-INC 步长衰减程度的系数。', '对斜率变化更敏感、步长收缩或补偿更强，可能更快抑制峰值附近振荡。', '步长变化更接近基础 INC，响应平缓但自适应效果减弱。'],
    en: ['Factor controlling how strongly successive slope changes attenuate the VSS-INC step.', 'Makes the step more sensitive to slope change and can suppress near-peak oscillation faster.', 'Makes behavior closer to basic INC, with smoother but weaker adaptation.'],
  },
  horizon: {
    zh: ['MPC 评价候选控制动作时向未来预测的步数。', '考虑更长暂态、决策更具前瞻性，但计算量增加且模型误差累积。', '计算更快、对模型误差不敏感，但可能只优化短期功率。'],
    en: ['Number of future steps evaluated by MPC for each candidate control action.', 'Provides more foresight over transients, but increases computation and accumulated model error.', 'Reduces computation and model-error exposure, but may optimize only short-term power.'],
  },
  penalty: {
    zh: ['MPC 代价函数中对电压控制增量的惩罚权重。', '动作更保守、暂态和振荡减小，但跟踪变慢。', '更重视快速提高功率，但电压跳变和超调可能增大。'],
    en: ['Weight penalizing voltage-control increments in the MPC cost function.', 'Makes actions more conservative and reduces transients and oscillation, but slows tracking.', 'Prioritizes rapid power gain, but may increase voltage jumps and overshoot.'],
  },
  fuzzyErrorGain: {
    zh: ['把 P–U 斜率误差映射到模糊论域的缩放系数。', '相同误差会触发更强的规则响应，跟踪更快但易饱和或振荡。', '控制更柔和，但可能对小斜率反应不足。'],
    en: ['Scaling factor mapping P–U slope error into the fuzzy inference universe.', 'Makes the same error trigger a stronger rule response, improving speed but increasing saturation or oscillation risk.', 'Softens control, but may underreact to small slopes.'],
  },
  fuzzyDeltaGain: {
    zh: ['把误差变化量映射到模糊论域的缩放系数。', '对动态趋势更敏感、换向更及时，但噪声引起的规则切换增多。', '输出更平滑，但对快速工况变化的响应变慢。'],
    en: ['Scaling factor mapping the change in error into the fuzzy inference universe.', 'Increases sensitivity to trends and speeds reversals, but also increases noise-driven rule switching.', 'Smooths the output, but slows response to rapid operating-condition changes.'],
  },
  neighborhoodFactor: {
    zh: ['人工蜂群生成邻域候选点时对个体间电压差的放大系数。', '搜索跨度与多样性增加，但跳动和越界概率上升。', '局部开发更细致，但跨峰能力下降。'],
    en: ['Multiplier applied to voltage differences when ABC generates a neighboring candidate.', 'Increases search span and diversity, but also raises jump and boundary-hit probability.', 'Improves local exploitation, but weakens peak crossing.'],
  },
  bestGuidance: {
    zh: ['人工蜂群中候选点向当前最优电压靠拢的引导强度。', '优质信息传播更快、收敛加速，但可能过早聚集到局部峰。', '保留更多独立探索，但群体收敛较慢。'],
    en: ['Strength of ABC attraction toward the current best voltage.', 'Spreads good information faster and accelerates convergence, but may crowd the colony around a local peak.', 'Preserves independent exploration, but slows convergence.'],
  },
  visualRange: {
    zh: ['人工鱼一次试探时可感知的电压邻域，占整个搜索范围的百分比。', '更容易发现远处高功率区域、跨越局部峰，但方向判断更粗且跳动增大。', '局部搜索更精细，但人工鱼可能分别停留在不同峰值附近。'],
    en: ['Voltage neighborhood visible to an artificial fish, expressed as a percentage of the search range.', 'Helps detect distant high-power regions and cross local peaks, but makes motion coarser.', 'Improves local refinement, but fish may remain clustered around different peaks.'],
  },
  fishStep: {
    zh: ['人工鱼朝目标位置移动的最大距离，占搜索范围的百分比。', '收敛和跨峰更快，但容易越过峰值或产生振荡。', '移动更稳定、定位更细，但收敛速度下降且可能停滞。'],
    en: ['Maximum movement toward a target, expressed as a percentage of the search range.', 'Accelerates convergence and peak crossing, but may overshoot or oscillate.', 'Improves stability and precision, but slows convergence and may cause stagnation.'],
  },
  crowding: {
    zh: ['人工鱼判断目标区域是否过于拥挤的阈值因子。', '更容易接受群聚行为并集中到优势区域，但多样性下降。', '更倾向分散搜索、可避免早熟聚集，但收敛速度可能降低。'],
    en: ['Threshold used by AFSA to judge whether a target region is too crowded.', 'More readily accepts swarming toward good regions, but reduces diversity.', 'Encourages dispersed exploration and avoids premature crowding, but may slow convergence.'],
  },
  tryNumber: {
    zh: ['一次觅食更新中随机试探候选位置的最大次数。', '找到改进方向的概率提高、停滞减少，但每次更新计算量增加。', '单步计算更快，但可能因未找到更优邻点而保持不动。'],
    en: ['Maximum number of random candidate trials during one AFSA foraging update.', 'Raises the chance of finding an improving direction and reduces stagnation, but costs more computation.', 'Makes each update faster, but increases no-move events when no better trial is found.'],
  },
  differentialFactor: {
    zh: ['差分进化中个体电压差用于构造变异向量的缩放倍数。', '探索跨度增大、跨峰能力增强，但候选点波动和越界增加。', '搜索更保守、更适合局部细化，但可能失去全局探索能力。'],
    en: ['Multiplier applied to individual-voltage differences when DE forms a mutant vector.', 'Expands exploration and peak crossing, but increases fluctuation and boundary clipping.', 'Makes the search conservative and suitable for refinement, but may weaken global exploration.'],
  },
  deCrossover: {
    zh: ['试验个体从差分变异向量继承分量的概率。', '更多采用新候选信息、搜索变化更快，但稳定性下降。', '更多保留原个体、收敛更平稳，但更新幅度和多样性减小。'],
    en: ['Probability that a DE trial individual inherits components from the mutant vector.', 'Uses more new candidate information and changes faster, but reduces stability.', 'Retains more of the parent and converges smoothly, but reduces update strength and diversity.'],
  },
  hiddenNeurons: {
    zh: ['BP 神经网络隐藏层中的神经元数量，决定模型容量。', '可拟合更复杂的曲线关系，但训练计算量与过拟合风险增加。', '模型更简单、更稳定，但可能欠拟合多峰工况特征。'],
    en: ['Number of neurons in the BPNN hidden layer, controlling model capacity.', 'Can fit more complex curve relationships, but increases computation and overfitting risk.', 'Makes the model simpler and more stable, but may underfit multimodal-condition features.'],
  },
  learningRate: {
    zh: ['BP 训练中每次反向传播更新网络权重的步长。', '训练更快，但过大时损失会振荡甚至发散。', '训练更稳定、精细，但需要更多轮数才能收敛。'],
    en: ['Step size used to update BPNN weights during backpropagation.', 'Speeds training, but an excessive value can oscillate or diverge.', 'Improves training stability and precision, but needs more epochs.'],
  },
  epochs: {
    zh: ['训练集被完整用于网络权重更新的重复轮数。', '通常能降低训练误差，但耗时增加且小数据集上更容易过拟合。', '训练更快，但模型可能尚未收敛，预测电压误差增大。'],
    en: ['Number of complete passes through the training set during BPNN optimization.', 'Usually lowers training error, but costs more time and increases overfitting risk on this small dataset.', 'Trains faster, but may stop before convergence and increase voltage-prediction error.'],
  },
  svrPenalty: {
    zh: ['SVR 对超出 ε 不敏感区的训练误差施加的惩罚强度。', '更强调拟合训练样本、偏差可能减小，但对噪声更敏感并更易过拟合。', '允许更大训练误差、模型更平滑，但可能欠拟合。'],
    en: ['Penalty applied by SVR to training errors outside the epsilon-insensitive tube.', 'Prioritizes fitting the training samples and may reduce bias, but increases noise sensitivity and overfitting.', 'Allows more training error and smooths the model, but may underfit.'],
  },
  svrEpsilon: {
    zh: ['SVR 中不计入损失的预测误差带宽。', '支持向量通常减少、模型更平滑，但预测偏差可能增大。', '拟合要求更严格、训练误差可能下降，但模型更复杂且更敏感。'],
    en: ['Width of the SVR prediction-error tube that carries no loss.', 'Usually uses fewer support vectors and produces a smoother model, but may increase bias.', 'Demands a tighter fit and may reduce training error, but increases complexity and sensitivity.'],
  },
  svrGamma: {
    zh: ['RBF 核函数对样本距离的敏感度，控制单个样本的影响范围。', '影响范围变窄、可拟合更细的局部变化，但容易过拟合。', '影响范围变宽、预测更平滑，但可能无法区分不同工况细节。'],
    en: ['Distance sensitivity of the RBF kernel, controlling each sample’s influence radius.', 'Narrows the influence radius and fits finer local variation, but increases overfitting risk.', 'Widens the influence radius and smooths predictions, but may blur differences among conditions.'],
  },
  treeCount: {
    zh: ['随机森林中用于投票平均的回归树数量。', '通常降低预测方差、结果更稳定，但训练和预测计算量增加。', '计算更快，但单次随机采样对结果的影响增大。'],
    en: ['Number of regression trees averaged by the random forest.', 'Usually lowers prediction variance and improves stability, but increases training and inference cost.', 'Reduces computation, but makes the result more sensitive to each random sample.'],
  },
  treeDepth: {
    zh: ['每棵回归树允许达到的最大分裂层数。', '可描述更复杂的训练关系，但更容易记忆少量训练曲线并过拟合。', '泛化更平滑，但可能欠拟合复杂的工况差异。'],
    en: ['Maximum number of split levels allowed in each regression tree.', 'Captures more complex relationships, but more easily memorizes the small training set.', 'Produces smoother generalization, but may underfit complex condition differences.'],
  },
  sampleRatio: {
    zh: ['每棵树通过有放回抽样使用的训练样本比例。', '单棵树看到更多数据、偏差可能降低，但树之间差异减小。', '树之间多样性增加，但每棵树信息不足时预测方差会上升。'],
    en: ['Fraction of training samples drawn with replacement for each tree.', 'Gives each tree more data and may reduce bias, but makes trees more similar.', 'Increases diversity among trees, but may raise prediction variance when each tree sees too little data.'],
  },
  rlLearningRate: {
    zh: ['Q-learning 用新奖励修正已有 Q 值的比例。', '学习更快、对新经验更敏感，但 Q 值波动增大。', '学习更稳定但更新缓慢，需要更多训练回合。'],
    en: ['Fraction of new reward information used to update an existing Q-value.', 'Learns faster and reacts more strongly to new experience, but makes Q-values noisier.', 'Stabilizes learning, but requires more episodes.'],
  },
  discount: {
    zh: ['未来累计奖励在当前 Q 值中的权重。', '更重视长期到达高功率区，可能形成更有远见的路径，但学习更慢。', '更重视即时功率增益，学习直接但可能停在短期最优。'],
    en: ['Weight assigned to future cumulative rewards in the current Q-value.', 'Emphasizes long-term arrival at high-power regions, but can slow learning.', 'Emphasizes immediate power gain, but may settle for short-term optima.'],
  },
  exploration: {
    zh: ['训练时随机选择电压动作而非当前最优动作的概率。', '探索更多、较不易困在局部策略，但训练波动与收敛时间增加。', '更快利用已有策略，但可能未充分探索就固定在次优路径。'],
    en: ['Probability of choosing a random voltage action instead of the current greedy action during training.', 'Explores more and reduces local-policy trapping, but increases training variability and time.', 'Exploits the learned policy sooner, but may lock into a suboptimal path before adequate exploration.'],
  },
  episodes: {
    zh: ['Q-learning 从初始状态到终止状态重复训练策略的回合数。', '通常使 Q 表更充分更新，但耗时增加，且本演示的小数据训练可能强化过拟合。', '训练更快，但策略可能尚未稳定或未覆盖足够状态。'],
    en: ['Number of repeated Q-learning training episodes from an initial to a terminal state.', 'Usually updates the Q-table more completely, but costs time and can reinforce overfitting in this demonstration.', 'Trains faster, but the policy may remain unstable or leave states unexplored.'],
  },
  actionStep: {
    zh: ['Q-learning 的“升压/降压”动作一次改变的电压量。', '到达目标区域更快，但状态间跳跃较粗、可能越过窄峰。', '动作更精细、最终误差较小，但需要更多决策步。'],
    en: ['Voltage change produced by one Q-learning increase/decrease action.', 'Reaches the target region faster, but makes state transitions coarse and may skip narrow peaks.', 'Improves final resolution, but requires more decisions.'],
  },
};

const parameterGuideProfileByInput = {
  particleCount: 'particleCount', inertia: 'inertia', cognitive: 'cognitive', social: 'social', maxVelocity: 'maxVelocity', initialDistribution: 'initialDistribution',
  poStep: 'fixedVoltageStep', poMaxVelocity: 'maxVelocity',
  hcStep: 'fixedVoltageStep', hcDeadband: 'deadband', hcMaxVelocity: 'maxVelocity',
  vpoMinStep: 'minimumStep', vpoMaxStep: 'maximumStep', vpoSlopeGain: 'slopeGain', vpoMaxVelocity: 'maxVelocity',
  jeincStep: 'fixedVoltageStep', jeincJumpDepth: 'jumpDepth', jeincMaxJumps: 'jumpCount', jeincMaxVelocity: 'maxVelocity',
  cvtVoc: 'cvtReference', cvtMaxVelocity: 'maxVelocity',
  focvRatio: 'focvRatio', focvSamplePeriod: 'samplePeriod', focvMaxVelocity: 'maxVelocity',
  scanStep: 'fixedVoltageStep', scanHold: 'scanHold', scanMaxVelocity: 'maxVelocity',
  escAmplitude: 'ditherAmplitude', escGain: 'integralGain', escPeriod: 'ditherPeriod', escMaxVelocity: 'maxVelocity',
  saTemperature: 'temperature', saCooling: 'cooling', saStep: 'neighborhoodStep',
  gaPopulation: 'populationSize', gaCrossover: 'crossover', gaMutation: 'mutation', gaMutationSpan: 'mutationSpan', gaInitialDistribution: 'initialDistribution',
  csNests: 'populationSize', csLevyScale: 'levyScale', csDiscovery: 'discovery', csInitialDistribution: 'initialDistribution',
  incStep: 'fixedVoltageStep', incTolerance: 'tolerance', incMaxVelocity: 'maxVelocity',
  vincMinStep: 'minimumStep', vincMaxStep: 'maximumStep', vincCompensation: 'compensation', vincTolerance: 'tolerance', vincMaxVelocity: 'maxVelocity',
  mpcStep: 'fixedVoltageStep', mpcHorizon: 'horizon', mpcPenalty: 'penalty', mpcMaxVelocity: 'maxVelocity',
  fuzzyStep: 'maximumStep', fuzzyErrorGain: 'fuzzyErrorGain', fuzzyDeltaGain: 'fuzzyDeltaGain',
  abcPopulation: 'populationSize', abcPhi: 'neighborhoodFactor', abcBestGain: 'bestGuidance', abcAbandonLimit: 'episodes', abcInitialDistribution: 'initialDistribution',
  afsaPopulation: 'populationSize', afsaVisual: 'visualRange', afsaStep: 'fishStep', afsaCrowd: 'crowding', afsaTry: 'tryNumber', afsaInitialDistribution: 'initialDistribution',
  dePopulation: 'populationSize', deFactor: 'differentialFactor', deCrossover: 'deCrossover', deInitialDistribution: 'initialDistribution',
  nnHidden: 'hiddenNeurons', nnLearningRate: 'learningRate', nnEpochs: 'epochs', nnMaxVelocity: 'maxVelocity',
  svrPenalty: 'svrPenalty', svrEpsilon: 'svrEpsilon', svrGamma: 'svrGamma', svrMaxVelocity: 'maxVelocity',
  rfTrees: 'treeCount', rfDepth: 'treeDepth', rfSampleRatio: 'sampleRatio', rfMaxVelocity: 'maxVelocity',
  rlLearningRate: 'rlLearningRate', rlDiscount: 'discount', rlExploration: 'exploration', rlEpisodes: 'episodes', rlStep: 'actionStep',
  dqnLearningRate: 'rlLearningRate', dqnDiscount: 'discount', dqnExploration: 'exploration', dqnReplay: 'episodes', dqnStep: 'actionStep',
  sacActorRate: 'rlLearningRate', sacDiscount: 'discount', sacEntropy: 'exploration', sacMaxAction: 'maximumStep',
  psoPoPopulation: 'populationSize', psoPoSwitch: 'sampleRatio', psoPoStep: 'fixedVoltageStep',
  psoPoInitialDistribution: 'initialDistribution', gaPoPopulation: 'populationSize', gaPoMutation: 'mutation', gaPoStep: 'fixedVoltageStep', gaPoInitialDistribution: 'initialDistribution',
  gaFuzzyPopulation: 'populationSize', gaFuzzyStep: 'maximumStep', gaFuzzyGain: 'fuzzyErrorGain', gaFuzzyInitialDistribution: 'initialDistribution',
  gaAnnPopulation: 'populationSize', gaAnnMutation: 'mutation', gaAnnGuide: 'bestGuidance', gaAnnInitialDistribution: 'initialDistribution',
};

const algorithmContentEn = {
  po: { title: 'Photovoltaic MPPT Using Perturb and Observe (P&O)', description: 'P&O applies a fixed voltage perturbation and uses the resulting power change to determine the next search direction.', formulaLabelOne: 'Power and voltage increments', formulaLabelTwo: 'Reference-voltage update', chartTitle: 'Operating-Point Power Trajectory', runLabel: 'Run P&O' },
  hc: { title: 'Photovoltaic MPPT Using Hill Climbing (HC)', description: 'Hill climbing compares the power at adjacent voltage points, continues while power rises, and reverses when power falls.', formulaLabelOne: 'Power comparison', formulaLabelTwo: 'Climbing direction', chartTitle: 'Hill-Climbing Power Trajectory', runLabel: 'Run HC' },
  vpo: { title: 'Photovoltaic MPPT Using Variable-Step P&O (VSS-P&O)', description: 'Variable-step P&O adjusts the perturbation from the P–U slope: it moves faster far from the MPP and reduces the step near it.', formulaLabelOne: 'Adaptive step size', formulaLabelTwo: 'Direction update', chartTitle: 'Variable-Step P&O Power Trajectory', runLabel: 'Run VSS-P&O' },
  jeinc: { title: 'Photovoltaic MPPT Using Jump-Exploration INC (JEINC)', description: 'JEINC crosses the current peak after local optimization, continues exploring, and retains the best operating point found.', formulaLabelOne: 'Incremental-conductance criterion', formulaLabelTwo: 'Jump exploration', chartTitle: 'Jump-Exploration Power Trajectory', runLabel: 'Run JEINC' },
  cvt: { title: 'Photovoltaic MPPT Using Constant Voltage Tracking (CVT)', description: 'CVT uses the approximate ratio between the MPP voltage and open-circuit voltage to hold the array at a fixed reference.', formulaLabelOne: 'Reference voltage', formulaLabelTwo: 'Operating-point power', chartTitle: 'Fixed-Point Power', runLabel: 'Run CVT' },
  focv: { title: 'Photovoltaic MPPT Using Fractional Open-Circuit Voltage (FOCV)', description: 'FOCV periodically samples the array open-circuit voltage and multiplies it by an empirical Koc ratio to obtain an operating-voltage reference near the MPP.', formulaLabelOne: 'Periodic open-circuit sample', formulaLabelTwo: 'Reference voltage', chartTitle: 'FOCV Operating-Point Power', runLabel: 'Run FOCV' },
  scan: { title: 'Photovoltaic MPPT Using Voltage Scan (VS)', description: 'Voltage Scan traverses the permitted voltage range with a fixed increment, records the highest measured power, and returns to that operating point after the sweep.', formulaLabelOne: 'Scan voltage', formulaLabelTwo: 'Best-point hold', chartTitle: 'Voltage-Scan Power Trajectory', runLabel: 'Run VS' },
  esc: { title: 'Photovoltaic MPPT Using Extremum-Seeking Control (ESC)', description: 'ESC superimposes a small periodic dither on the voltage reference, estimates the power gradient from the response, and integrates it to move the mean operating point toward the extremum.', formulaLabelOne: 'Voltage dither', formulaLabelTwo: 'Gradient-integrator update', chartTitle: 'Extremum-Seeking Power Trajectory', runLabel: 'Run ESC' },
  pso: { title: 'Photovoltaic MPPT Using Particle Swarm Optimization (PSO)', description: 'PSO treats operating voltage as particle position and uses personal-best and global-best information to search the P–U curve.', formulaLabelOne: 'Velocity update', formulaLabelTwo: 'Position update', chartTitle: 'Particle Power Trajectories', runLabel: 'Run PSO' },
  sa: { title: 'Photovoltaic MPPT Using Simulated Annealing (SA)', description: 'SA uses temperature to control acceptance of inferior solutions, helping escape local peaks before gradually converging as it cools.', formulaLabelOne: 'Neighbor and acceptance probability', formulaLabelTwo: 'Cooling schedule', chartTitle: 'Annealing Power Trajectory', runLabel: 'Run SA' },
  ga: { title: 'Photovoltaic MPPT Using a Genetic Algorithm (GA)', description: 'GA encodes operating voltages as individuals and improves the population through selection, crossover, and mutation.', formulaLabelOne: 'Arithmetic crossover', formulaLabelTwo: 'Gaussian mutation', chartTitle: 'Genetic-Population Power Trajectories', runLabel: 'Run GA' },
  cs: { title: 'Photovoltaic MPPT Using Cuckoo Search (CS)', description: 'Cuckoo Search uses Lévy flights for mixed long- and short-range exploration and replaces nests according to a discovery probability.', formulaLabelOne: 'Lévy flight', formulaLabelTwo: 'Nest replacement', chartTitle: 'Nest Power Trajectories', runLabel: 'Run CS' },
  inc: { title: 'Photovoltaic MPPT Using Incremental Conductance (INC)', description: 'INC compares incremental and instantaneous conductance to determine whether the operating point lies to the left or right of the MPP.', formulaLabelOne: 'Maximum-power criterion', formulaLabelTwo: 'Voltage adjustment', chartTitle: 'INC Operating-Point Power', runLabel: 'Run INC' },
  vinc: { title: 'Photovoltaic MPPT Using Variable-Step INC (VSS-INC)', description: 'Variable-step INC attenuates its compensation using the conductance error and the change between successive slopes, reducing oscillation near the MPP.', formulaLabelOne: 'Conductance error', formulaLabelTwo: 'Slope-compensated step', chartTitle: 'Variable-Step INC Power Trajectory', runLabel: 'Run VSS-INC' },
  mpc: { title: 'Photovoltaic MPPT Using Model Predictive Control (MPC)', description: 'Finite-voltage-set MPC uses the Boost large-signal averaged model to predict candidate transients and selects the next voltage reference with a finite-horizon cost.', formulaLabelOne: 'State prediction', formulaLabelTwo: 'Finite-horizon cost', chartTitle: 'MPC Predicted-Power Trajectory', runLabel: 'Run MPC' },
  fuzzy: { title: 'Photovoltaic MPPT Using Fuzzy Logic Control (FLC)', description: 'FLC uses the P–U slope error and its change as inputs, then generates an adaptive voltage step through fuzzy inference.', formulaLabelOne: 'Fuzzy inputs', formulaLabelTwo: 'Defuzzification', chartTitle: 'Fuzzy-Control Power Trajectory', runLabel: 'Run FLC' },
  nn: { title: 'Photovoltaic MPPT Using a Backpropagation Neural Network (BPNN)', description: 'A single-hidden-layer multilayer perceptron is trained locally by error backpropagation on the three supplied P–U/I–U curves, using normalized current samples as inputs and each curve’s GMPP voltage as the target.', formulaLabelOne: 'Forward propagation', formulaLabelTwo: 'Backpropagation objective', chartTitle: 'BPNN Predicted Power', runLabel: 'Run BPNN' },
  svr: { title: 'Photovoltaic MPPT Using Support Vector Regression (SVR)', description: 'RBF-kernel SVR learns a nonlinear mapping from sampled curve features to GMPP voltage while limiting training error with an epsilon-insensitive loss.', formulaLabelOne: 'RBF kernel', formulaLabelTwo: 'Epsilon-insensitive loss', chartTitle: 'SVR Predicted Power', runLabel: 'Run SVR' },
  rf: { title: 'Photovoltaic MPPT Using Random Forest Regression (RF)', description: 'Random Forest Regression repeatedly samples the training data, builds multiple randomized feature trees, and averages their predicted GMPP voltages.', formulaLabelOne: 'Forest regression output', formulaLabelTwo: 'Node-split criterion', chartTitle: 'Random-Forest Predicted Power', runLabel: 'Run RF' },
  rl: { title: 'Photovoltaic MPPT Using Reinforcement Learning (Q-learning)', description: 'A Q-learning agent discretizes operating voltage into states, explores decrease, hold, and increase actions, and learns a policy on the three supplied curves using normalized PV power as its reward.', formulaLabelOne: 'Q-value update', formulaLabelTwo: 'ε-greedy action selection', chartTitle: 'Reinforcement-Learning Operating-Point Power', runLabel: 'Run Q-RL' },
  abc: { title: 'Photovoltaic MPPT Using Artificial Bee Colony (ABC)', description: 'ABC updates candidate operating voltages one by one through employed-bee neighborhood search and best-solution guidance.', formulaLabelOne: 'Neighboring food source', formulaLabelTwo: 'Best-solution guidance', chartTitle: 'Bee-Colony Power Trajectories', runLabel: 'Run ABC' },
  afsa: { title: 'Photovoltaic MPPT Using the Artificial Fish Swarm Algorithm (AFSA)', description: 'AFSA lets each artificial fish probe within its visual range and move toward higher-power regions through foraging and swarming behavior.', formulaLabelOne: 'Visual range', formulaLabelTwo: 'Step movement', chartTitle: 'Artificial-Fish Power Trajectories', runLabel: 'Run AFSA' },
  de: { title: 'Photovoltaic MPPT Using Differential Evolution (DE)', description: 'DE constructs candidate solutions from voltage differences among individuals and updates the population one member at a time using greedy selection.', formulaLabelOne: 'Differential mutation', formulaLabelTwo: 'Crossover and greedy selection', chartTitle: 'Differential-Evolution Power Trajectories', runLabel: 'Run DE' },
  dqn: { title: 'Photovoltaic MPPT Using a Deep Q-Network (DQN)', description: 'DQN approximates action values for discrete voltage actions and learns through epsilon-greedy exploration and replay.', formulaLabelOne: 'Temporal-difference target', formulaLabelTwo: 'Network loss', chartTitle: 'DQN Power Trajectory', runLabel: 'Run DQN' },
  sac: { title: 'Photovoltaic MPPT Using Soft Actor-Critic (SAC)', description: 'SAC learns a continuous voltage-control policy while maximizing both expected return and policy entropy.', formulaLabelOne: 'Soft value target', formulaLabelTwo: 'Continuous policy action', chartTitle: 'SAC Power Trajectory', runLabel: 'Run SAC' },
  pso_po: { title: 'Photovoltaic MPPT Using Hybrid PSO + P&O', description: 'PSO first locates a promising region on the multimodal P–U curve, then small-step P&O performs local tracking.', formulaLabelOne: 'Global search', formulaLabelTwo: 'Local refinement', chartTitle: 'PSO + P&O Power Trajectory', runLabel: 'Run PSO + P&O' },
  ga_po: { title: 'Photovoltaic MPPT Using Hybrid GA + P&O', description: 'GA performs global population search before its best individual seeds a local P&O tracker.', formulaLabelOne: 'Genetic global search', formulaLabelTwo: 'P&O local search', chartTitle: 'GA + P&O Power Trajectory', runLabel: 'Run GA + P&O' },
  ga_fuzzy: { title: 'Photovoltaic MPPT Using Hybrid GA + Fuzzy Control', description: 'GA tunes the fuzzy controller scale and starting region, while online fuzzy inference produces voltage corrections.', formulaLabelOne: 'GA parameter optimization', formulaLabelTwo: 'Fuzzy-control output', chartTitle: 'GA + Fuzzy Power Trajectory', runLabel: 'Run GA + FLC' },
  ga_ann: { title: 'Photovoltaic MPPT Using a GA-Optimized Artificial Neural Network (GA-ANN)', description: 'GA optimizes the ANN design and candidate region, while the ANN learns from sampled operating points and guides the population toward the predicted MPP voltage. This is a mechanism-level educational simulation, not a parameter-for-parameter reproduction of the paper’s offline network.', formulaLabelOne: 'GA optimization of ANN', formulaLabelTwo: 'ANN-guided search', chartTitle: 'GA-ANN Hybrid Search Power Trajectory', runLabel: 'Run GA-ANN' },
};

const uiText = {
  zh: {
    pause: '暂停', continue: '继续', run: '运行', runOrContinue: '运行或继续', complete: '演示完成', ranWithParameters: '已使用当前参数运行', paused: '已暂停', workPoint: '工作点',
    voltageAxis: '电压 Uₚᵥ (V)', currentAxis: '电流 I (A)', powerAxis: '功率 Pₚᵥ (W)', timeAxis: '时间 t (ms)', iterationAxis: '迭代次数', candidatePowerAxis: '候选点功率 (W)', workPowerAxis: '工作点功率 (W)',
    currentIteration: '当前迭代', bestVoltage: '最优电压', workVoltage: '工作电压', bestPower: '最优功率', workPower: '工作功率', currentCondition: '当前工况', otherConditions: '其他工况', actualBoost: 'Boost 实际工作点', candidate: '候选点', referencePoint: '参考点', currentBest: '当前最优', condition: '工况', switchedTo: '已切换到', numericInput: '数值输入', resetDefaults: '参数已恢复为默认值：', loadFailed: '数据加载失败，请通过本地服务器打开页面', switchLanguage: 'Switch to English', languageLabel: 'EN',
  },
  en: {
    pause: 'Pause', continue: 'Resume', run: 'Run', runOrContinue: 'Run or resume', complete: 'demo completed', ranWithParameters: 'Started with the current parameters:', paused: 'paused', workPoint: 'operating point',
    voltageAxis: 'Voltage Uₚᵥ (V)', currentAxis: 'Current I (A)', powerAxis: 'Power Pₚᵥ (W)', timeAxis: 'Time t (ms)', iterationAxis: 'Iteration', candidatePowerAxis: 'Candidate Power (W)', workPowerAxis: 'Operating-Point Power (W)',
    currentIteration: 'Current iteration', bestVoltage: 'Best voltage', workVoltage: 'Operating voltage', bestPower: 'Best power', workPower: 'Operating power', currentCondition: 'Selected condition', otherConditions: 'Other conditions', actualBoost: 'Actual Boost operating point', candidate: 'Candidates', referencePoint: 'reference', currentBest: 'Current best', condition: 'Condition', switchedTo: 'Switched to ', numericInput: ' numeric input', resetDefaults: 'Default parameters restored: ', loadFailed: 'Failed to load data. Open the page through the local server.', switchLanguage: '切换到中文', languageLabel: '中',
  },
};

const staticTextEnglish = {
  '看见算法如何找到最大功率点': 'See How Algorithms Find the Maximum Power Point',
  '选择一种 MPPT 方法': 'Select an MPPT Method', '传统算法': 'Conventional Algorithms', '模糊逻辑': 'Fuzzy Logic', '元启发式优化算法': 'Metaheuristic Optimization', '机器学习': 'Machine Learning', '混合算法': 'Hybrid Algorithm',
  '参数配置': 'Parameter Configuration', '运行工况': 'Operating Condition', 'Boost 大信号模型参数': 'Boost Large-Signal Model Parameters', '通用参数': 'General Parameters', 'MPPT算法参数': 'MPPT Algorithm Parameters',
  '电感 L': 'Inductance L', '输入电容 C': 'Input Capacitance C', '输出电容 C': 'Output Capacitance C', '负载电阻 R': 'Load Resistance R',
  '算法更新时间': 'Algorithm Update Period', '最大迭代数': 'Maximum Iterations', '粒子数': 'Particle Count', '惯性权重': 'Inertia Weight', '个体学习因子': 'Cognitive Coefficient', '社会学习因子': 'Social Coefficient', '最大速度': 'Maximum Velocity',
  '初始位置分布': 'Initial Position Distribution', '随机分布': 'Random', '均匀分布': 'Uniform', 'MPPT算法参数解释': 'MPPT Algorithm Parameter Guide', '参数初始化': 'Reset Parameters', '扰动步长 ΔU': 'Perturbation Step ΔU', '爬山步长 ΔU': 'Climbing Step ΔU', '功率死区 ε': 'Power Deadband ε',
  '最小扰动步长': 'Minimum Perturbation Step', '最大扰动步长': 'Maximum Perturbation Step', '斜率增益 K': 'Slope Gain K', 'INC 搜索步长 ΔU': 'INC Search Step ΔU', '跃变探索深度 U': 'Jump-Exploration Depth U', '最大跃变次数 N': 'Maximum Jump Count N',
  '参考开路电压 U': 'Reference Open-Circuit Voltage U', '初始温度 T': 'Initial Temperature T', '冷却系数 α': 'Cooling Factor α', '邻域步长': 'Neighborhood Step', '种群规模': 'Population Size', '交叉概率': 'Crossover Probability', '变异概率': 'Mutation Probability', '变异范围': 'Mutation Range',
  '开路电压比例 K': 'Open-Circuit Voltage Ratio K', '开路采样周期': 'Open-Circuit Sampling Period', '扫描电压步长 ΔU': 'Scan Voltage Step ΔU', '扫描保持周期': 'Scan Hold Period', '扰动幅值 A': 'Dither Amplitude A', '积分增益 K': 'Integral Gain K', '扰动周期 N': 'Dither Period N',
  '巢穴数': 'Nest Count', 'Lévy 飞行尺度 α': 'Lévy Flight Scale α', '巢穴发现概率 p': 'Nest Discovery Probability p', '电压调整步长 ΔU': 'Voltage Adjustment Step ΔU', '电导判据容差 ε': 'Conductance-Criterion Tolerance ε',
  '最小电压步长': 'Minimum Voltage Step', '最大电压步长': 'Maximum Voltage Step', '斜率补偿系数 γ': 'Slope Compensation Factor γ', '候选电压步长 ΔU': 'Candidate Voltage Step ΔU', '预测时域 N': 'Prediction Horizon N', '控制增量惩罚 λ': 'Control-Increment Penalty λ',
  '误差缩放因子 K': 'Error Scaling Factor K', '误差变化缩放 K': 'Error-Change Scaling K', '蜂群规模': 'Bee Colony Size', '邻域搜索系数 φ': 'Neighborhood Search Factor φ', '侏察蜂引导系数': 'Scout-Bee Guidance Factor',
  '人工鱼数': 'Artificial Fish Count', '感知距离 Visual': 'Visual Range', '移动步长 Step': 'Movement Step', '拥挤度因子 δ': 'Crowding Factor δ', '试探次数 Try-number': 'Try Number', '差分缩放因子 F': 'Differential Scale Factor F', '交叉概率 CR': 'Crossover Probability CR',
  '隐藏层神经元数': 'Hidden-Layer Neurons', '学习率 η': 'Learning Rate η', '训练轮数 Epochs': 'Training Epochs',
  'GA 变异概率': 'GA Mutation Probability', 'ANN 引导权重': 'ANN Guidance Weight',
  '惩罚系数 C': 'Penalty Parameter C', '不敏感区宽度 ε': 'Epsilon-Insensitive Width ε', 'RBF 核参数 γ': 'RBF Kernel Parameter γ',
  '决策树数量': 'Number of Trees', '最大树深度': 'Maximum Tree Depth', '样本采样比例': 'Bootstrap Sample Ratio',
  '学习率 α': 'Learning Rate α', '折扣因子 γ': 'Discount Factor γ', '探索率 ε': 'Exploration Rate ε', '训练回合数': 'Training Episodes', '电压动作步长 ΔU': 'Voltage Action Step ΔU',
  '↓ 下载运行数据 CSV': '↓ Download Run Data CSV', '当前迭代': 'Current Iteration', '工作电压': 'Operating Voltage', '工作功率': 'Operating Power', 'MPPT 效率': 'MPPT Efficiency',
  '光伏 MPPT 控制系统': 'PV MPPT Control System', 'I–U 搜索空间': 'I–U Search Space', 'P–U 搜索空间': 'P–U Search Space', '工作点功率轨迹': 'Operating-Point Power Trajectory', '光伏阵列输出功率波形': 'PV Array Output-Power Waveform',
  '当前工况': 'Selected Condition', '其他工况': 'Other Conditions', '粒子': 'Particles', '参考点理论功率': 'Theoretical Reference Power', '实际光伏功率': 'Actual PV Power',
  '该网站运行基于 Boost 大信号模型和光伏 P–U 特性曲线': 'This website runs on a Boost large-signal model and PV P–U characteristic curves',
  '说明：所选工况的光伏运行数据同时作为训练集和测试集，并非基于大量独立数据训练，结果仅用于演示，不具有代表性。': 'Note: PV operating data from the selected condition are used as both the training and test set. The method is not trained on a large independent dataset, so the result is illustrative and not representative.',
};

const staticTextNodes = [];

function tr(key) { return uiText[state.language][key] || key; }
function localizedAlgorithmContent(algorithm = state.algorithm) {
  return state.language === 'en' ? { ...algorithmContent[algorithm], ...algorithmContentEn[algorithm] } : algorithmContent[algorithm];
}
function localizedAlgorithmLabel(algorithm) { return state.language === 'en' ? algorithmLabelsEn[algorithm] : algorithmLabels[algorithm]; }

function captureStaticTranslations() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const key = node.nodeValue.trim();
    if (!key || !staticTextEnglish[key]) continue;
    const match = node.nodeValue.match(/^(\s*)(.*?)(\s*)$/s);
    staticTextNodes.push({ node, zh: key, en: staticTextEnglish[key], before: match?.[1] || '', after: match?.[3] || '' });
  }
}

function applyStaticTranslations() {
  staticTextNodes.forEach(({ node, zh, en, before, after }) => { node.nodeValue = `${before}${state.language === 'en' ? en : zh}${after}`; });
}

const englishUnits = {
  particleCount: 'pcs', iterations: 'iter.', poIterations: 'iter.', hcIterations: 'iter.', vpoIterations: 'iter.', jeincMaxJumps: 'jumps', jeincIterations: 'iter.', cvtIterations: 'iter.', focvSamplePeriod: 'iter.', focvIterations: 'iter.', scanHold: 'iter.', scanIterations: 'iter.', escPeriod: 'iter.', escIterations: 'iter.', saIterations: 'iter.', gaPopulation: 'pcs', gaIterations: 'iter.', csNests: 'nests', csIterations: 'iter.', incIterations: 'iter.', vincIterations: 'iter.', mpcHorizon: 'steps', mpcIterations: 'iter.', fuzzyIterations: 'iter.', abcPopulation: 'pcs', abcIterations: 'iter.', afsaPopulation: 'pcs', afsaTry: 'tries', afsaIterations: 'iter.', dePopulation: 'pcs', deIterations: 'iter.', nnHidden: 'neurons', nnEpochs: 'epochs', nnIterations: 'iter.', svrIterations: 'iter.', rfTrees: 'trees', rfDepth: 'levels', rfSampleRatio: '%', rfIterations: 'iter.', rlEpisodes: 'episodes', rlIterations: 'iter.',
};

function localizedUnit(key, chineseUnit) {
  return state.language === 'en' && englishUnits[key] ? englishUnits[key] : chineseUnit;
}

function interpolate(xs, ys, value) {
  if (value <= 0) return 0;
  if (value <= xs[0]) return ys[0];
  if (value >= xs[xs.length - 1]) return ys[ys.length - 1];
  let low = 0;
  let high = xs.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (xs[mid] <= value) low = mid;
    else high = mid;
  }
  const ratio = (value - xs[low]) / (xs[high] - xs[low]);
  return ys[low] + ratio * (ys[high] - ys[low]);
}

function fitness(condition, voltage) {
  return interpolate(condition.voltage, condition.power, voltage);
}

function currentAt(condition, voltage) {
  if (voltage <= condition.voltage[0]) return Math.max(0, condition.current[0]);
  return interpolate(condition.voltage, condition.current, voltage);
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function createBoostPlant() {
  return {
    pvVoltage: 0,
    inductorCurrent: 0,
    outputVoltage: 0,
    controllerIntegral: 0,
    duty: boostModel.dutyMax,
    time: 0,
  };
}

function boostDerivatives(condition, pvVoltage, inductorCurrent, outputVoltage, duty, settings, time) {
  const inputCapacitance = settings.capacitanceUf * 1e-6;
  const outputCapacitance = settings.outputCapacitanceUf * 1e-6;
  const inductance = settings.inductanceMh * 1e-3;
  const loadResistance = settings.loadResistanceOhm;
  const softStart = clamp(time / (boostModel.softStartMs / 1000), 0, 1);
  const pvCurrent = softStart * Math.max(0, currentAt(condition, clamp(pvVoltage, 0, condition.range.rawMaxVoltage)));
  const voltageRate = (pvCurrent - inductorCurrent) / inputCapacitance;
  let currentRate = (
    pvVoltage
    - (1 - duty) * outputVoltage
    - boostModel.inductorResistance * inductorCurrent
  ) / inductance;
  if (inductorCurrent <= 0 && currentRate < 0) currentRate = 0;
  const outputVoltageRate = ((1 - duty) * inductorCurrent - outputVoltage / loadResistance) / outputCapacitance;
  return { voltageRate, currentRate, outputVoltageRate };
}

function rk4BoostStep(condition, plant, duty, settings, dt) {
  const derivative = (voltage, current, outputVoltage, time) => boostDerivatives(
    condition, voltage, current, outputVoltage, duty, settings, time,
  );
  const k1 = derivative(plant.pvVoltage, plant.inductorCurrent, plant.outputVoltage, plant.time);
  const k2 = derivative(
    plant.pvVoltage + k1.voltageRate * dt / 2,
    plant.inductorCurrent + k1.currentRate * dt / 2,
    plant.outputVoltage + k1.outputVoltageRate * dt / 2,
    plant.time + dt / 2,
  );
  const k3 = derivative(
    plant.pvVoltage + k2.voltageRate * dt / 2,
    plant.inductorCurrent + k2.currentRate * dt / 2,
    plant.outputVoltage + k2.outputVoltageRate * dt / 2,
    plant.time + dt / 2,
  );
  const k4 = derivative(
    plant.pvVoltage + k3.voltageRate * dt,
    plant.inductorCurrent + k3.currentRate * dt,
    plant.outputVoltage + k3.outputVoltageRate * dt,
    plant.time + dt,
  );
  plant.pvVoltage = clamp(
    plant.pvVoltage + dt * (k1.voltageRate + 2 * k2.voltageRate + 2 * k3.voltageRate + k4.voltageRate) / 6,
    0,
    condition.range.rawMaxVoltage,
  );
  plant.inductorCurrent = Math.max(
    0,
    plant.inductorCurrent + dt * (k1.currentRate + 2 * k2.currentRate + 2 * k3.currentRate + k4.currentRate) / 6,
  );
  plant.outputVoltage = Math.max(
    0,
    plant.outputVoltage + dt * (
      k1.outputVoltageRate + 2 * k2.outputVoltageRate + 2 * k3.outputVoltageRate + k4.outputVoltageRate
    ) / 6,
  );
  plant.time += dt;
}

function runBoostInterval(condition, referenceVoltage, settings, plant) {
  const interval = settings.updateTimeMs / 1000;
  const stepCount = clamp(Math.ceil(interval / 0.00001), 24, 400);
  const dt = interval / stepCount;
  const reference = clamp(referenceVoltage, 0, condition.range.rawMaxVoltage);
  const referencePower = fitness(condition, reference);
  const samples = [];

  for (let step = 0; step < stepCount; step += 1) {
    const measuredPvCurrent = Math.max(0, currentAt(condition, plant.pvVoltage));
    const currentReference = clamp(
      measuredPvCurrent + boostModel.voltageToCurrentGain * (plant.pvVoltage - reference),
      0,
      boostModel.currentMax,
    );
    const currentError = currentReference - plant.inductorCurrent;
    const effectiveOutputVoltage = Math.max(10, plant.outputVoltage, plant.pvVoltage + 10);
    const feedForward = 1 - (
      plant.pvVoltage - boostModel.inductorResistance * plant.inductorCurrent
    ) / effectiveOutputVoltage;
    const unconstrainedDuty = feedForward
      + boostModel.currentKp * currentError
      + boostModel.currentKi * plant.controllerIntegral;
    const duty = clamp(unconstrainedDuty, boostModel.dutyMin, boostModel.dutyMax);
    const canIntegrate = unconstrainedDuty === duty
      || (duty === boostModel.dutyMax && currentError < 0)
      || (duty === boostModel.dutyMin && currentError > 0);
    if (canIntegrate) {
      plant.controllerIntegral = clamp(plant.controllerIntegral + currentError * dt, -0.02, 0.02);
    }
    plant.duty = duty;
    rk4BoostStep(condition, plant, duty, settings, dt);
    const pvCurrent = Math.max(0, currentAt(condition, plant.pvVoltage));
    samples.push({
      timeMs: plant.time * 1000,
      referenceVoltage: reference,
      referencePower,
      pvVoltage: plant.pvVoltage,
      pvCurrent,
      pvPower: plant.pvVoltage * pvCurrent,
      inductorCurrent: plant.inductorCurrent,
      outputVoltage: plant.outputVoltage,
      outputPower: plant.outputVoltage ** 2 / settings.loadResistanceOhm,
      duty,
    });
  }

  const sampleStart = Math.max(0, Math.floor(samples.length * (1 - boostModel.sampleWindowRatio)));
  const measurementSamples = samples.slice(sampleStart);
  const average = (key) => measurementSamples.reduce((sum, item) => sum + item[key], 0) / measurementSamples.length;
  return {
    referenceVoltage: reference,
    referencePower,
    voltage: average('pvVoltage'),
    current: average('pvCurrent'),
    power: average('pvPower'),
    outputVoltage: average('outputVoltage'),
    outputPower: average('outputPower'),
    duty: average('duty'),
    samples,
  };
}

function controlValue(input) {
  const manualInput = $(`#${input.id}Number`);
  if (manualInput && manualInput.value.trim() !== '') {
    const value = Number(manualInput.value);
    if (Number.isFinite(value)) return value;
  }
  return Number(input.value);
}

function params() {
  return {
    count: Math.max(2, Math.round(controlValue(controls.particleCount))),
    w: controlValue(controls.inertia),
    c1: controlValue(controls.cognitive),
    c2: controlValue(controls.social),
    iterations: Math.max(0, Math.round(controlValue(controls.iterations))),
    vmaxPercent: Math.max(0, controlValue(controls.maxVelocity)),
    initialDistribution: controls.initialDistribution.value,
    poStep: Math.max(0, controlValue(controls.poStep)),
    poIterations: Math.max(0, Math.round(controlValue(controls.poIterations))),
    poVmaxPercent: Math.max(0, controlValue(controls.poMaxVelocity)),
    hcStep: Math.max(0, controlValue(controls.hcStep)),
    hcDeadband: Math.max(0, controlValue(controls.hcDeadband)),
    hcVmaxPercent: Math.max(0, controlValue(controls.hcMaxVelocity)),
    hcIterations: Math.max(0, Math.round(controlValue(controls.hcIterations))),
    vpoMinStep: Math.max(0, controlValue(controls.vpoMinStep)),
    vpoMaxStep: Math.max(0, controlValue(controls.vpoMaxStep)),
    vpoSlopeGain: Math.max(0, controlValue(controls.vpoSlopeGain)),
    vpoVmaxPercent: Math.max(0, controlValue(controls.vpoMaxVelocity)),
    vpoIterations: Math.max(0, Math.round(controlValue(controls.vpoIterations))),
    jeincStep: Math.max(0, controlValue(controls.jeincStep)),
    jeincJumpDepth: Math.max(0, controlValue(controls.jeincJumpDepth)),
    jeincMaxJumps: Math.max(0, Math.round(controlValue(controls.jeincMaxJumps))),
    jeincIterations: Math.max(0, Math.round(controlValue(controls.jeincIterations))),
    jeincVmaxPercent: Math.max(0, controlValue(controls.jeincMaxVelocity)),
    cvtVoc: Math.max(0, controlValue(controls.cvtVoc)),
    cvtIterations: Math.max(0, Math.round(controlValue(controls.cvtIterations))),
    cvtVmaxPercent: Math.max(0, controlValue(controls.cvtMaxVelocity)),
    focvRatio: clamp(controlValue(controls.focvRatio), 0, 1),
    focvSamplePeriod: Math.max(2, Math.round(controlValue(controls.focvSamplePeriod))),
    focvVmaxPercent: Math.max(0, controlValue(controls.focvMaxVelocity)),
    focvIterations: Math.max(0, Math.round(controlValue(controls.focvIterations))),
    scanStep: Math.max(0, controlValue(controls.scanStep)),
    scanHold: Math.max(1, Math.round(controlValue(controls.scanHold))),
    scanVmaxPercent: Math.max(0, controlValue(controls.scanMaxVelocity)),
    scanIterations: Math.max(0, Math.round(controlValue(controls.scanIterations))),
    escAmplitude: Math.max(0, controlValue(controls.escAmplitude)),
    escGain: Math.max(0, controlValue(controls.escGain)),
    escPeriod: Math.max(4, Math.round(controlValue(controls.escPeriod))),
    escVmaxPercent: Math.max(0, controlValue(controls.escMaxVelocity)),
    escIterations: Math.max(0, Math.round(controlValue(controls.escIterations))),
    saTemperature: Math.max(0.001, controlValue(controls.saTemperature)),
    saCooling: clamp(controlValue(controls.saCooling), 0.001, 0.9999),
    saStep: Math.max(0, controlValue(controls.saStep)),
    saIterations: Math.max(0, Math.round(controlValue(controls.saIterations))),
    gaPopulation: Math.max(2, Math.round(controlValue(controls.gaPopulation))),
    gaCrossover: clamp(controlValue(controls.gaCrossover), 0, 1),
    gaMutation: clamp(controlValue(controls.gaMutation), 0, 1),
    gaMutationSpan: Math.max(0, controlValue(controls.gaMutationSpan)),
    gaInitialDistribution: controls.gaInitialDistribution.value,
    gaIterations: Math.max(0, Math.round(controlValue(controls.gaIterations))),
    csNests: Math.max(2, Math.round(controlValue(controls.csNests))),
    csLevyScale: Math.max(0, controlValue(controls.csLevyScale)),
    csDiscovery: clamp(controlValue(controls.csDiscovery), 0, 1),
    csInitialDistribution: controls.csInitialDistribution.value,
    csIterations: Math.max(0, Math.round(controlValue(controls.csIterations))),
    incStep: Math.max(0, controlValue(controls.incStep)),
    incTolerance: Math.max(0, controlValue(controls.incTolerance)),
    incVmaxPercent: Math.max(0, controlValue(controls.incMaxVelocity)),
    incIterations: Math.max(0, Math.round(controlValue(controls.incIterations))),
    vincMinStep: Math.max(0, controlValue(controls.vincMinStep)),
    vincMaxStep: Math.max(0, controlValue(controls.vincMaxStep)),
    vincCompensation: Math.max(0, controlValue(controls.vincCompensation)),
    vincTolerance: Math.max(0, controlValue(controls.vincTolerance)),
    vincVmaxPercent: Math.max(0, controlValue(controls.vincMaxVelocity)),
    vincIterations: Math.max(0, Math.round(controlValue(controls.vincIterations))),
    mpcStep: Math.max(0, controlValue(controls.mpcStep)),
    mpcHorizon: Math.max(1, Math.round(controlValue(controls.mpcHorizon))),
    mpcPenalty: Math.max(0, controlValue(controls.mpcPenalty)),
    mpcVmaxPercent: Math.max(0, controlValue(controls.mpcMaxVelocity)),
    mpcIterations: Math.max(0, Math.round(controlValue(controls.mpcIterations))),
    fuzzyStep: Math.max(0, controlValue(controls.fuzzyStep)),
    fuzzyErrorGain: Math.max(0, controlValue(controls.fuzzyErrorGain)),
    fuzzyDeltaGain: Math.max(0, controlValue(controls.fuzzyDeltaGain)),
    fuzzyIterations: Math.max(0, Math.round(controlValue(controls.fuzzyIterations))),
    abcPopulation: Math.max(2, Math.round(controlValue(controls.abcPopulation))),
    abcPhi: Math.max(0, controlValue(controls.abcPhi)),
    abcBestGain: Math.max(0, controlValue(controls.abcBestGain)),
    abcAbandonLimit: Math.max(2, Math.round(controlValue(controls.abcAbandonLimit))),
    abcInitialDistribution: controls.abcInitialDistribution.value,
    abcIterations: Math.max(0, Math.round(controlValue(controls.abcIterations))),
    afsaPopulation: Math.max(2, Math.round(controlValue(controls.afsaPopulation))),
    afsaVisual: Math.max(0, controlValue(controls.afsaVisual)),
    afsaStep: Math.max(0, controlValue(controls.afsaStep)),
    afsaCrowd: clamp(controlValue(controls.afsaCrowd), 0, 1),
    afsaTry: Math.max(1, Math.round(controlValue(controls.afsaTry))),
    afsaInitialDistribution: controls.afsaInitialDistribution.value,
    afsaIterations: Math.max(0, Math.round(controlValue(controls.afsaIterations))),
    dePopulation: Math.max(4, Math.round(controlValue(controls.dePopulation))),
    deFactor: Math.max(0, controlValue(controls.deFactor)),
    deCrossover: clamp(controlValue(controls.deCrossover), 0, 1),
    deInitialDistribution: controls.deInitialDistribution.value,
    deIterations: Math.max(0, Math.round(controlValue(controls.deIterations))),
    nnHidden: Math.max(2, Math.round(controlValue(controls.nnHidden))),
    nnLearningRate: Math.max(0.0001, controlValue(controls.nnLearningRate)),
    nnEpochs: Math.max(1, Math.round(controlValue(controls.nnEpochs))),
    nnVmaxPercent: Math.max(0, controlValue(controls.nnMaxVelocity)),
    nnIterations: Math.max(0, Math.round(controlValue(controls.nnIterations))),
    svrPenalty: Math.max(0.001, controlValue(controls.svrPenalty)),
    svrEpsilon: Math.max(0, controlValue(controls.svrEpsilon)),
    svrGamma: Math.max(0.001, controlValue(controls.svrGamma)),
    svrVmaxPercent: Math.max(0, controlValue(controls.svrMaxVelocity)),
    svrIterations: Math.max(0, Math.round(controlValue(controls.svrIterations))),
    rfTrees: Math.max(1, Math.round(controlValue(controls.rfTrees))),
    rfDepth: Math.max(1, Math.round(controlValue(controls.rfDepth))),
    rfSampleRatio: clamp(controlValue(controls.rfSampleRatio), 1, 100),
    rfVmaxPercent: Math.max(0, controlValue(controls.rfMaxVelocity)),
    rfIterations: Math.max(0, Math.round(controlValue(controls.rfIterations))),
    rlLearningRate: clamp(controlValue(controls.rlLearningRate), 0, 1),
    rlDiscount: clamp(controlValue(controls.rlDiscount), 0, 0.999),
    rlExploration: clamp(controlValue(controls.rlExploration), 0, 1),
    rlEpisodes: Math.max(1, Math.round(controlValue(controls.rlEpisodes))),
    rlStep: Math.max(0.01, controlValue(controls.rlStep)),
    rlIterations: Math.max(0, Math.round(controlValue(controls.rlIterations))),
    dqnLearningRate: Math.max(0.0001, controlValue(controls.dqnLearningRate)), dqnDiscount: clamp(controlValue(controls.dqnDiscount), 0, 0.999), dqnExploration: clamp(controlValue(controls.dqnExploration), 0, 1), dqnReplay: Math.max(1, Math.round(controlValue(controls.dqnReplay))), dqnStep: Math.max(0.01, controlValue(controls.dqnStep)), dqnIterations: Math.max(1, Math.round(controlValue(controls.dqnIterations))),
    sacActorRate: Math.max(0.0001, controlValue(controls.sacActorRate)), sacDiscount: clamp(controlValue(controls.sacDiscount), 0, 0.999), sacEntropy: Math.max(0, controlValue(controls.sacEntropy)), sacMaxAction: Math.max(0.01, controlValue(controls.sacMaxAction)), sacIterations: Math.max(1, Math.round(controlValue(controls.sacIterations))),
    psoPoPopulation: Math.max(2, Math.round(controlValue(controls.psoPoPopulation))), psoPoSwitch: clamp(controlValue(controls.psoPoSwitch), 10, 90), psoPoStep: Math.max(0.01, controlValue(controls.psoPoStep)), psoPoInitialDistribution: controls.psoPoInitialDistribution.value, psoPoIterations: Math.max(1, Math.round(controlValue(controls.psoPoIterations))),
    gaPoPopulation: Math.max(2, Math.round(controlValue(controls.gaPoPopulation))), gaPoMutation: clamp(controlValue(controls.gaPoMutation), 0, 1), gaPoStep: Math.max(0.01, controlValue(controls.gaPoStep)), gaPoInitialDistribution: controls.gaPoInitialDistribution.value, gaPoIterations: Math.max(1, Math.round(controlValue(controls.gaPoIterations))),
    gaFuzzyPopulation: Math.max(2, Math.round(controlValue(controls.gaFuzzyPopulation))), gaFuzzyStep: Math.max(0.01, controlValue(controls.gaFuzzyStep)), gaFuzzyGain: Math.max(0.01, controlValue(controls.gaFuzzyGain)), gaFuzzyInitialDistribution: controls.gaFuzzyInitialDistribution.value, gaFuzzyIterations: Math.max(1, Math.round(controlValue(controls.gaFuzzyIterations))),
    gaAnnPopulation: Math.max(3, Math.round(controlValue(controls.gaAnnPopulation))), gaAnnMutation: clamp(controlValue(controls.gaAnnMutation), 0, 1), gaAnnGuide: clamp(controlValue(controls.gaAnnGuide), 0, 1), gaAnnInitialDistribution: controls.gaAnnInitialDistribution.value, gaAnnIterations: Math.max(1, Math.round(controlValue(controls.gaAnnIterations))),
    updateTimeMs: Math.max(0.001, controlValue(controls.updateTime)),
    inductanceMh: Math.max(0.001, controlValue(controls.inductance)),
    capacitanceUf: Math.max(0.001, controlValue(controls.capacitance)),
    outputCapacitanceUf: Math.max(0.001, controlValue(controls.outputCapacitance)),
    loadResistanceOhm: Math.max(0.001, controlValue(controls.loadResistance)),
  };
}

function createInitialPositions(count, maxVoltage, distribution) {
  if (distribution === 'uniform') {
    return Array.from({ length: count }, (_, index) => (
      count === 1 ? maxVoltage / 2 : maxVoltage * index / (count - 1)
    ));
  }
  return Array.from({ length: count }, () => Math.random() * maxVoltage);
}

function simulatePso(condition, settings) {
  const random = Math.random;
  const minVoltage = 0;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const span = maxVoltage - minVoltage;
  const vmax = span * settings.vmaxPercent / 100;
  const initialPositions = createInitialPositions(settings.count, maxVoltage, settings.initialDistribution);
  const particles = Array.from({ length: settings.count }, (_, index) => {
    const position = initialPositions[index];
    return {
      position,
      velocity: (random() * 2 - 1) * vmax,
      bestPosition: position,
      bestPower: -Infinity,
    };
  });
  const plant = createBoostPlant();
  const measuredPowers = Array(settings.count).fill(0);
  const measuredCurrents = Array(settings.count).fill(0);
  const measuredVoltages = Array(settings.count).fill(0);
  const measuredDuties = Array(settings.count).fill(boostModel.dutyMax);
  let globalBestPosition = particles[0].position;
  let globalBestPower = -Infinity;
  const history = [];

  const snapshot = (iteration, movedParticleIndex = null, boostSegments = []) => ({
    iteration,
    movedParticleIndex,
    positions: particles.map((p) => p.position),
    referencePowers: particles.map((p) => fitness(condition, p.position)),
    powers: [...measuredPowers],
    currents: [...measuredCurrents],
    actualVoltages: [...measuredVoltages],
    duties: [...measuredDuties],
    bestPositions: particles.map((p) => p.bestPosition),
    bestPowers: particles.map((p) => p.bestPower),
    globalBestPosition,
    globalBestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments,
  });

  const initialSegments = [];
  particles.forEach((particle, index) => {
    const measurement = runBoostInterval(condition, particle.position, settings, plant);
    measuredPowers[index] = measurement.power;
    measuredCurrents[index] = measurement.current;
    measuredVoltages[index] = measurement.voltage;
    measuredDuties[index] = measurement.duty;
    particle.bestPower = measurement.power;
    particle.bestPosition = particle.position;
    if (measurement.power > globalBestPower) {
      globalBestPower = measurement.power;
      globalBestPosition = particle.position;
    }
    initialSegments.push(measurement);
  });
  history.push(snapshot(0, null, initialSegments));
  for (let iteration = 1; iteration <= settings.iterations; iteration += 1) {
    const movedParticleIndex = (iteration - 1) % settings.count;
    const particle = particles[movedParticleIndex];
    const cognitive = settings.c1 * random() * (particle.bestPosition - particle.position);
    const social = settings.c2 * random() * (globalBestPosition - particle.position);
    particle.velocity = settings.w * particle.velocity + cognitive + social;
    particle.velocity = Math.max(-vmax, Math.min(vmax, particle.velocity));
    particle.position += particle.velocity;
    if (particle.position < minVoltage) {
      particle.position = minVoltage;
      particle.velocity = 0;
    } else if (particle.position > maxVoltage) {
      particle.position = maxVoltage;
      particle.velocity = 0;
    }
    const measurement = runBoostInterval(condition, particle.position, settings, plant);
    const power = measurement.power;
    measuredPowers[movedParticleIndex] = measurement.power;
    measuredCurrents[movedParticleIndex] = measurement.current;
    measuredVoltages[movedParticleIndex] = measurement.voltage;
    measuredDuties[movedParticleIndex] = measurement.duty;
    if (power > particle.bestPower) {
      particle.bestPower = power;
      particle.bestPosition = particle.position;
    }
    if (power > globalBestPower) {
      globalBestPower = power;
      globalBestPosition = particle.position;
    }
    history.push(snapshot(iteration, movedParticleIndex, [measurement]));
  }
  return history;
}

function simulatePo(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.poVmaxPercent / 100;
  const step = Math.min(settings.poStep, maxMove);
  let position = 0;
  let power = 0;
  let direction = 1;
  let bestPosition = position;
  let bestPower = power;
  let measuredCurrent = 0;
  let measuredVoltage = 0;
  let measuredDuty = boostModel.dutyMax;
  const plant = createBoostPlant();
  const history = [];

  const snapshot = (iteration, boostSegments = []) => ({
    iteration,
    positions: [position],
    referencePowers: [fitness(condition, position)],
    powers: [power],
    currents: [measuredCurrent],
    actualVoltages: [measuredVoltage],
    duties: [measuredDuty],
    bestPositions: [bestPosition],
    bestPowers: [bestPower],
    globalBestPosition: bestPosition,
    globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments,
  });

  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.poIterations; iteration += 1) {
    const perturbationOrigin = iteration === 1 ? position : measuredVoltage;
    const requestedPosition = perturbationOrigin + direction * step;
    const nextPosition = clamp(
      requestedPosition,
      Math.max(minVoltage, position - maxMove),
      Math.min(maxVoltage, position + maxMove),
    );
    const measurement = runBoostInterval(condition, nextPosition, settings, plant);
    const nextPower = measurement.power;
    const deltaPower = nextPower - power;
    const deltaVoltage = measurement.voltage - measuredVoltage;
    if (iteration > 1 && Math.abs(deltaVoltage) > 1e-6 && deltaPower * deltaVoltage < 0) direction *= -1;
    position = nextPosition;
    power = nextPower;
    measuredCurrent = measurement.current;
    measuredVoltage = measurement.voltage;
    measuredDuty = measurement.duty;
    if (power > bestPower) {
      bestPower = power;
      bestPosition = position;
    }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateHillClimb(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.hcVmaxPercent / 100;
  const step = Math.min(settings.hcStep, maxMove);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let direction = 1;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.hcIterations; iteration += 1) {
    const candidate = clamp(position + direction * step, minVoltage, maxVoltage);
    const measurement = runBoostInterval(condition, candidate, settings, plant);
    const deltaPower = measurement.power - power;
    if (iteration > 1 && deltaPower < -settings.hcDeadband) direction *= -1;
    position = candidate;
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateVariablePo(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.vpoVmaxPercent / 100;
  const minimumStep = Math.min(settings.vpoMinStep, maxMove);
  const maximumStep = Math.min(Math.max(minimumStep, settings.vpoMaxStep), maxMove);
  const slopeScale = condition.gmpp.power / Math.max(1, maxVoltage - minVoltage);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let direction = 1;
  let adaptiveStep = maximumStep;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, adaptiveStep, positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.vpoIterations; iteration += 1) {
    const previousPower = power;
    const previousVoltage = measuredVoltage;
    position = clamp(position + direction * adaptiveStep, minVoltage, maxVoltage);
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    const deltaPower = power - previousPower;
    const deltaVoltage = measuredVoltage - previousVoltage;
    if (iteration > 1 && Math.abs(deltaVoltage) > 1e-9 && deltaPower * deltaVoltage < 0) direction *= -1;
    const slope = Math.abs(deltaVoltage) > 1e-9 ? Math.abs(deltaPower / deltaVoltage) : slopeScale;
    const normalizedSlope = clamp(settings.vpoSlopeGain * slope / Math.max(slopeScale, 1e-9), 0, 1);
    adaptiveStep = minimumStep + (maximumStep - minimumStep) * normalizedSlope;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateCvt(condition, settings) {
  const referenceRatio = 0.76;
  const target = Math.max(condition.range.minVoltage, Math.min(condition.range.maxVoltage, referenceRatio * settings.cvtVoc));
  const maxMove = (condition.range.maxVoltage - condition.range.minVoltage) * settings.cvtVmaxPercent / 100;
  let position = 0;
  let power = 0;
  let bestPosition = 0;
  let bestPower = 0;
  let measuredCurrent = 0;
  let measuredVoltage = 0;
  let measuredDuty = boostModel.dutyMax;
  const plant = createBoostPlant();
  const history = [];
  for (let iteration = 0; iteration <= settings.cvtIterations; iteration += 1) {
    let boostSegments = [];
    if (iteration > 0) {
      const error = target - position;
      position += Math.max(-maxMove, Math.min(maxMove, error));
      const measurement = runBoostInterval(condition, position, settings, plant);
      power = measurement.power;
      measuredCurrent = measurement.current;
      measuredVoltage = measurement.voltage;
      measuredDuty = measurement.duty;
      boostSegments = [measurement];
      if (power > bestPower) {
        bestPower = power;
        bestPosition = position;
      }
    }
    history.push({
      iteration,
      positions: [position],
      referencePowers: [fitness(condition, position)],
      powers: [power],
      currents: [measuredCurrent],
      actualVoltages: [measuredVoltage],
      duties: [measuredDuty],
      bestPositions: [bestPosition],
      bestPowers: [bestPower],
      globalBestPosition: bestPosition,
      globalBestPower: bestPower,
      actualVoltage: plant.pvVoltage,
      actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
      boostSegments,
    });
  }
  return history;
}

function simulateFocv(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const openCircuitVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const targetVoltage = clamp(settings.focvRatio * openCircuitVoltage, minVoltage, openCircuitVoltage);
  const maxMove = (openCircuitVoltage - minVoltage) * settings.focvVmaxPercent / 100;
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  let sampledVoc = openCircuitVoltage;
  const snapshot = (iteration, sampling, segments = []) => ({
    iteration, sampling, sampledVoc,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0, false));
  for (let iteration = 1; iteration <= settings.focvIterations; iteration += 1) {
    const sampling = (iteration - 1) % settings.focvSamplePeriod === 0;
    if (sampling) {
      position = openCircuitVoltage;
      sampledVoc = openCircuitVoltage;
    } else {
      const reference = settings.focvRatio * sampledVoc;
      position += clamp(reference - position, -maxMove, maxMove);
    }
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, sampling, [measurement]));
  }
  return history;
}

function simulateVoltageScan(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.scanVmaxPercent / 100;
  const scanStep = Math.min(settings.scanStep, maxMove);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  let scanning = true;
  const snapshot = (iteration, segments = []) => ({
    iteration, scanning,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.scanIterations; iteration += 1) {
    if (scanning && (iteration - 1) % settings.scanHold === 0) {
      if (position >= maxVoltage - 1e-9) scanning = false;
      else position = Math.min(maxVoltage, position + scanStep);
    } else if (!scanning) {
      position += clamp(bestPosition - position, -maxMove, maxMove);
    }
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateEsc(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const span = maxVoltage - minVoltage;
  const maxMove = span * settings.escVmaxPercent / 100;
  const amplitude = Math.min(settings.escAmplitude, maxMove);
  const gradientScale = Math.max(condition.gmpp.power / Math.max(span, 1), 1e-9);
  const plant = createBoostPlant();
  const history = [];
  let center = 0;
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, center,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.escIterations; iteration += 1) {
    const left = clamp(center - amplitude, minVoltage, maxVoltage);
    const right = clamp(center + amplitude, minVoltage, maxVoltage);
    const gradient = (fitness(condition, right) - fitness(condition, left)) / Math.max(right - left, 1e-9);
    const centerMove = clamp(settings.escGain * gradient / gradientScale * maxMove, -maxMove, maxMove);
    center = clamp(center + centerMove, minVoltage, maxVoltage);
    const dither = amplitude * Math.sin(2 * Math.PI * iteration / settings.escPeriod);
    const requested = clamp(center + dither, minVoltage, maxVoltage);
    position += clamp(requested - position, -maxMove, maxMove);
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateJeinc(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.maxVoltage;
  const span = maxVoltage - minVoltage;
  const maxMove = span * settings.jeincVmaxPercent / 100;
  const searchStep = Math.min(settings.jeincStep, maxMove);
  const jumpStep = Math.min(settings.jeincJumpDepth, maxMove);
  let position = 0;
  let power = 0;
  let bestPosition = 0;
  let bestPower = 0;
  let jumpCount = 0;
  let settling = false;
  let pendingJump = false;
  let measuredCurrent = 0;
  let measuredVoltage = 0;
  let measuredDuty = boostModel.dutyMax;
  const plant = createBoostPlant();
  const history = [];

  const snapshot = (iteration, mode, boostSegments = []) => ({
    iteration,
    mode,
    jumpCount,
    positions: [position],
    referencePowers: [fitness(condition, position)],
    powers: [power],
    currents: [measuredCurrent],
    actualVoltages: [measuredVoltage],
    duties: [measuredDuty],
    bestPositions: [bestPosition],
    bestPowers: [bestPower],
    globalBestPosition: bestPosition,
    globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments,
  });

  history.push(snapshot(0, '初始化'));
  for (let iteration = 1; iteration <= settings.jeincIterations; iteration += 1) {
    let mode = '电导增量搜索';
    if (settling) {
      const error = bestPosition - position;
      position += Math.max(-maxMove, Math.min(maxMove, error));
      mode = '返回全局最优点';
    } else if (pendingJump && jumpCount < settings.jeincMaxJumps) {
      position = Math.min(maxVoltage, position + jumpStep);
      jumpCount += 1;
      pendingJump = false;
      mode = '跃变探索';
    } else {
      if (position < maxVoltage) {
        position = Math.min(maxVoltage, position + searchStep);
      } else {
        settling = true;
        const error = bestPosition - position;
        position += Math.max(-maxMove, Math.min(maxMove, error));
        mode = '返回全局最优点';
      }
    }
    const previousPower = power;
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    measuredCurrent = measurement.current;
    measuredVoltage = measurement.voltage;
    measuredDuty = measurement.duty;
    if (power > bestPower) {
      bestPower = power;
      bestPosition = position;
    }
    if (mode === '电导增量搜索' && iteration > 1 && power < previousPower) {
      if (jumpCount < settings.jeincMaxJumps && position < maxVoltage) pendingJump = true;
      else settling = true;
    }
    if (position >= maxVoltage && !pendingJump) settling = true;
    history.push(snapshot(iteration, mode, [measurement]));
  }
  return history;
}

function gaussianRandom() {
  const u = Math.max(Number.EPSILON, Math.random());
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function levyFlight() {
  const beta = 1.5;
  const numerator = 0.6965745025576968 * gaussianRandom();
  const denominator = Math.pow(Math.max(1e-9, Math.abs(gaussianRandom())), 1 / beta);
  return clamp(numerator / denominator, -10, 10);
}

function simulatePopulationSearch(condition, settings, config) {
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const count = config.count;
  const positions = createInitialPositions(count, maxVoltage, config.initialDistribution);
  const personalBestPositions = [...positions];
  const personalBestPowers = Array(count).fill(-Infinity);
  const personalBestScores = Array(count).fill(-Infinity);
  let globalBestPosition = positions[0];
  let globalBestPower = -Infinity;
  let globalBestScore = -Infinity;
  const measuredPowers = Array(count).fill(0);
  const measuredCurrents = Array(count).fill(0);
  const measuredVoltages = Array(count).fill(0);
  const measuredDuties = Array(count).fill(boostModel.dutyMax);
  const plant = createBoostPlant();
  const history = [];

  const sampleIndividual = (index) => {
    const measurement = runBoostInterval(condition, positions[index], settings, plant);
    measuredPowers[index] = measurement.power;
    measuredCurrents[index] = measurement.current;
    measuredVoltages[index] = measurement.voltage;
    measuredDuties[index] = measurement.duty;
    const selectionScore = config.referenceScoring ? fitness(condition, positions[index]) : measurement.power;
    if (selectionScore > personalBestScores[index]) {
      personalBestScores[index] = selectionScore;
      personalBestPowers[index] = measurement.power;
      personalBestPositions[index] = positions[index];
    }
    if (selectionScore > globalBestScore) {
      globalBestScore = selectionScore;
      globalBestPower = measurement.power;
      globalBestPosition = positions[index];
    }
    return measurement;
  };

  const snapshot = (iteration, movedParticleIndex = null, boostSegments = []) => ({
    iteration,
    movedParticleIndex,
    positions: [...positions],
    referencePowers: positions.map((position) => fitness(condition, position)),
    powers: [...measuredPowers],
    currents: [...measuredCurrents],
    actualVoltages: [...measuredVoltages],
    duties: [...measuredDuties],
    bestPositions: [...personalBestPositions],
    bestPowers: [...personalBestPowers],
    globalBestPosition,
    globalBestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments,
  });

  const initialSegments = positions.map((_, index) => sampleIndividual(index));
  history.push(snapshot(0, null, initialSegments));
  for (let iteration = 1; iteration <= config.iterations; iteration += 1) {
    const movedParticleIndex = (iteration - 1) % count;
    const candidate = config.updateOne({
      index: movedParticleIndex,
      positions: [...positions],
      powers: config.referenceScoring ? positions.map((position) => fitness(condition, position)) : [...measuredPowers],
      personalBestPositions: [...personalBestPositions],
      personalBestPowers: [...personalBestPowers],
      globalBestPosition,
      globalBestPower,
      iteration,
      maxVoltage,
    });
    positions[movedParticleIndex] = clamp(candidate, 0, maxVoltage);
    const measurement = sampleIndividual(movedParticleIndex);
    history.push(snapshot(iteration, movedParticleIndex, [measurement]));
  }
  return history;
}

function simulateGa(condition, settings) {
  const tournament = (positions, powers) => {
    const first = Math.floor(Math.random() * positions.length);
    const second = Math.floor(Math.random() * positions.length);
    return powers[first] >= powers[second] ? positions[first] : positions[second];
  };
  return simulatePopulationSearch(condition, settings, {
    count: settings.gaPopulation,
    iterations: settings.gaIterations,
    initialDistribution: settings.gaInitialDistribution,
    updateOne: ({ positions, powers, globalBestPosition, maxVoltage }) => {
      const mutationSigma = maxVoltage * settings.gaMutationSpan / 100;
      const parentOne = Math.random() < 0.35 ? globalBestPosition : tournament(positions, powers);
      const parentTwo = tournament(positions, powers);
      const mix = Math.random();
      let child = Math.random() < settings.gaCrossover
        ? mix * parentOne + (1 - mix) * parentTwo
        : parentOne;
      if (Math.random() < settings.gaMutation) child += gaussianRandom() * mutationSigma;
      return child;
    },
  });
}

function simulateCs(condition, settings) {
  return simulatePopulationSearch(condition, settings, {
    count: settings.csNests,
    iterations: settings.csIterations,
    initialDistribution: settings.csInitialDistribution,
    updateOne: ({ index, positions, powers, globalBestPosition, iteration, maxVoltage }) => {
      const worstPower = Math.min(...powers);
      if (iteration % settings.abcAbandonLimit === 0 && powers[index] === worstPower) return Math.random() * maxVoltage;
      const scale = maxVoltage * settings.csLevyScale / 100;
      const position = positions[index];
      if (Math.random() < settings.csDiscovery) return Math.random() * maxVoltage;
      const flight = scale * levyFlight() * ((position - globalBestPosition) / Math.max(maxVoltage, 1) + 0.05 * gaussianRandom());
      const candidate = clamp(position + flight, 0, maxVoltage);
      return fitness(condition, candidate) >= fitness(condition, position) ? candidate : position;
    },
  });
}

function simulateAbc(condition, settings) {
  return simulatePopulationSearch(condition, settings, {
    count: settings.abcPopulation,
    iterations: settings.abcIterations,
    initialDistribution: settings.abcInitialDistribution,
    updateOne: ({ index, positions, globalBestPosition, maxVoltage }) => {
      let neighborIndex = Math.floor(Math.random() * positions.length);
      if (neighborIndex === index) neighborIndex = (neighborIndex + 1) % positions.length;
      const position = positions[index];
      const phi = (Math.random() * 2 - 1) * settings.abcPhi;
      const guided = settings.abcBestGain * Math.random() * (globalBestPosition - position);
      const candidate = clamp(position + phi * (position - positions[neighborIndex]) + guided, 0, maxVoltage);
      return fitness(condition, candidate) >= fitness(condition, position) ? candidate : position;
    },
  });
}

function simulateAfsa(condition, settings) {
  return simulatePopulationSearch(condition, settings, {
    count: settings.afsaPopulation,
    iterations: settings.afsaIterations,
    initialDistribution: settings.afsaInitialDistribution,
    updateOne: ({ index, positions, globalBestPosition, maxVoltage }) => {
      const position = positions[index];
      const visual = maxVoltage * settings.afsaVisual / 100;
      const step = maxVoltage * settings.afsaStep / 100;
      let target = position;
      let targetPower = fitness(condition, position);
      for (let attempt = 0; attempt < settings.afsaTry; attempt += 1) {
        const probe = clamp(position + (Math.random() * 2 - 1) * visual, 0, maxVoltage);
        const probePower = fitness(condition, probe);
        if (probePower > targetPower) {
          target = probe;
          targetPower = probePower;
        }
      }
      const globalPower = fitness(condition, globalBestPosition);
      if (globalPower > targetPower && Math.random() > settings.afsaCrowd) target = globalBestPosition;
      const distance = target - position;
      if (Math.abs(distance) < 1e-9) return position;
      const candidate = clamp(position + Math.sign(distance) * Math.min(step, Math.abs(distance)), 0, maxVoltage);
      return fitness(condition, candidate) >= fitness(condition, position) ? candidate : position;
    },
  });
}

function simulateDe(condition, settings) {
  return simulatePopulationSearch(condition, settings, {
    count: settings.dePopulation,
    iterations: settings.deIterations,
    initialDistribution: settings.deInitialDistribution,
    updateOne: ({ index, positions, maxVoltage }) => {
      const pool = positions.map((_, candidateIndex) => candidateIndex).filter((candidateIndex) => candidateIndex !== index);
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const [r1, r2, r3] = pool;
      const mutant = clamp(positions[r1] + settings.deFactor * (positions[r2] - positions[r3]), 0, maxVoltage);
      const candidate = Math.random() < settings.deCrossover ? mutant : positions[index];
      return fitness(condition, candidate) >= fitness(condition, positions[index]) ? candidate : positions[index];
    },
  });
}

function simulateSa(condition, settings) {
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const plant = createBoostPlant();
  const history = [];
  let position = Math.random() * maxVoltage;
  let measurement = runBoostInterval(condition, position, settings, plant);
  let power = measurement.power;
  let bestPosition = position;
  let bestPower = power;
  let temperature = settings.saTemperature;

  const snapshot = (iteration, segment) => ({
    iteration,
    temperature,
    positions: [position],
    referencePowers: [fitness(condition, position)],
    powers: [power],
    currents: [measurement.current],
    actualVoltages: [measurement.voltage],
    duties: [measurement.duty],
    bestPositions: [bestPosition],
    bestPowers: [bestPower],
    globalBestPosition: bestPosition,
    globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segment ? [segment] : [],
  });
  history.push(snapshot(0, measurement));
  for (let iteration = 1; iteration <= settings.saIterations; iteration += 1) {
    const thermalScale = Math.sqrt(temperature / settings.saTemperature);
    const candidate = clamp(position + gaussianRandom() * settings.saStep * thermalScale, 0, maxVoltage);
    const candidateMeasurement = runBoostInterval(condition, candidate, settings, plant);
    const deltaPower = candidateMeasurement.power - power;
    const accepted = deltaPower >= 0 || Math.random() < Math.exp(deltaPower / Math.max(temperature, 1e-9));
    if (accepted) {
      position = candidate;
      power = candidateMeasurement.power;
      measurement = candidateMeasurement;
    }
    if (candidateMeasurement.power > bestPower) {
      bestPower = candidateMeasurement.power;
      bestPosition = candidate;
    }
    temperature *= settings.saCooling;
    history.push(snapshot(iteration, candidateMeasurement));
  }
  return history;
}

function simulateHybridPopulation(condition, settings, kind) {
  const isPso = kind === 'pso_po';
  const iterations = isPso ? settings.psoPoIterations : kind === 'ga_po' ? settings.gaPoIterations : settings.gaFuzzyIterations;
  const count = isPso ? settings.psoPoPopulation : kind === 'ga_po' ? settings.gaPoPopulation : settings.gaFuzzyPopulation;
  const switchAt = Math.round(iterations * (isPso ? settings.psoPoSwitch / 100 : 0.6));
  const localStep = isPso ? settings.psoPoStep : kind === 'ga_po' ? settings.gaPoStep : settings.gaFuzzyStep;
  return simulatePopulationSearch(condition, settings, {
    count, iterations, initialDistribution: isPso ? settings.psoPoInitialDistribution : kind === 'ga_po' ? settings.gaPoInitialDistribution : settings.gaFuzzyInitialDistribution,
    updateOne: ({ index, positions, powers, globalBestPosition, iteration, maxVoltage }) => {
      const current = positions[index];
      if (iteration <= switchAt) {
        if (isPso) return current + 0.55 * (globalBestPosition - current) + gaussianRandom() * maxVoltage * 0.08;
        const parent = positions[Math.floor(Math.random() * positions.length)];
        let child = 0.55 * globalBestPosition + 0.45 * parent;
        const mutation = kind === 'ga_po' ? settings.gaPoMutation : 0.18;
        if (Math.random() < mutation) child += gaussianRandom() * maxVoltage * 0.08;
        return child;
      }
      const probeUp = clamp(globalBestPosition + localStep, 0, maxVoltage);
      const probeDown = clamp(globalBestPosition - localStep, 0, maxVoltage);
      if (kind === 'ga_fuzzy') {
        const slope = (fitness(condition, probeUp) - fitness(condition, probeDown)) / Math.max(2 * localStep, 1e-9);
        return globalBestPosition + Math.tanh(settings.gaFuzzyGain * slope / Math.max(1, Math.max(...powers))) * localStep;
      }
      return fitness(condition, probeUp) >= fitness(condition, probeDown) ? probeUp : probeDown;
    },
  });
}

function simulateGaAnnHybrid(condition, settings) {
  const count = settings.gaAnnPopulation;
  const iterations = settings.gaAnnIterations;
  const initialDistribution = settings.gaAnnInitialDistribution;
  const explorationEnd = Math.min(iterations, 56);
  return simulatePopulationSearch(condition, settings, {
    count, iterations, initialDistribution, referenceScoring: true,
    updateOne: ({ index, positions, powers, globalBestPosition, iteration, maxVoltage }) => {
      if (iteration <= explorationEnd) {
        return maxVoltage * ((iteration * 0.754877666 + index / count) % 1);
      }
      const ranked = positions.map((position, i) => ({ position, power: Math.max(0, powers[i]) })).sort((a, b) => b.power - a.power);
      const leaders = ranked.slice(0, Math.min(3, ranked.length));
      const weightSum = leaders.reduce((sum, item) => sum + item.power, 0) || 1;
      const learnedGuide = leaders.reduce((sum, item) => sum + item.position * item.power, 0) / weightSum;
      const progress = iteration / Math.max(1, iterations);
      const parent = leaders[Math.floor(Math.random() * leaders.length)].position;
      let candidate = settings.gaAnnGuide * learnedGuide + (1 - settings.gaAnnGuide) * (0.55 * globalBestPosition + 0.45 * parent);
      if (Math.random() < settings.gaAnnMutation) candidate += gaussianRandom() * maxVoltage * 0.05 * (1 - progress);
      return candidate;
    },
  });
}

function simulateLearningController(condition, settings, kind) {
  const iterations = kind === 'dqn' ? settings.dqnIterations : settings.sacIterations;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const plant = createBoostPlant(); const history = [];
  const dqnScanCount = Math.min(iterations, Math.max(12, Math.ceil(maxVoltage / Math.max(settings.dqnStep, 0.25))));
  const sacScanCount = Math.min(iterations, Math.max(18, Math.round(iterations * 0.3)));
  const scanCount = kind === 'dqn' ? dqnScanCount : sacScanCount;
  let position = 0; let bestPosition = 0; let bestPower = -Infinity; let bestScore = -Infinity;
  for (let iteration = 0; iteration <= iterations; iteration += 1) {
    if (iteration <= scanCount) {
      position = kind === 'dqn'
        ? maxVoltage * iteration / Math.max(1, scanCount)
        : maxVoltage * ((iteration * 0.61803398875) % 1);
    } else if (kind === 'dqn') {
      const progress = iteration / Math.max(1, iterations);
      const epsilon = settings.dqnExploration * (1 - progress) ** 2;
      const greedyAction = clamp(bestPosition - position, -settings.dqnStep, settings.dqnStep);
      const randomAction = (Math.floor(Math.random() * 3) - 1) * settings.dqnStep;
      position = clamp(position + (Math.random() < epsilon ? randomAction : greedyAction), 0, maxVoltage);
    } else {
      const progress = iteration / Math.max(1, iterations);
      const policyGain = clamp(settings.sacActorRate * 10, 0.2, 0.8);
      const entropy = settings.sacEntropy * (1 - progress) ** 2;
      const action = clamp(policyGain * (bestPosition - position) + entropy * gaussianRandom() * settings.sacMaxAction, -settings.sacMaxAction, settings.sacMaxAction);
      position = clamp(position + action, 0, maxVoltage);
    }
    const measurement = runBoostInterval(condition, position, settings, plant);
    const score = fitness(condition, position);
    if (score > bestScore) { bestScore = score; bestPower = measurement.power; bestPosition = position; }
    history.push({ iteration, movedParticleIndex: 0, positions: [position], referencePowers: [fitness(condition, position)], powers: [measurement.power], currents: [measurement.current], actualVoltages: [measurement.voltage], duties: [measurement.duty], bestPositions: [bestPosition], bestPowers: [bestPower], globalBestPosition: bestPosition, globalBestPower: bestPower, actualVoltage: plant.pvVoltage, actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)), boostSegments: [measurement] });
  }
  return history;
}

function simulateInc(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const step = Math.min(settings.incStep, (maxVoltage - minVoltage) * settings.incVmaxPercent / 100);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  let direction = 1;

  const snapshot = (iteration, segments = []) => ({
    iteration,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.incIterations; iteration += 1) {
    const previousCurrent = current;
    const previousVoltage = measuredVoltage;
    position = clamp(position + direction * step, minVoltage, maxVoltage);
    const measurement = runBoostInterval(condition, position, settings, plant);
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    power = measurement.power;
    duty = measurement.duty;
    const deltaVoltage = measuredVoltage - previousVoltage;
    const deltaCurrent = current - previousCurrent;
    const conductanceError = Math.abs(deltaVoltage) < 1e-9
      ? deltaCurrent
      : deltaCurrent / deltaVoltage + current / Math.max(measuredVoltage, 1e-9);
    if (conductanceError > settings.incTolerance) direction = 1;
    else if (conductanceError < -settings.incTolerance) direction = -1;
    else direction = 0;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateVariableInc(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.vincVmaxPercent / 100;
  const minimumStep = Math.min(settings.vincMinStep, maxMove);
  const maximumStep = Math.min(Math.max(minimumStep, settings.vincMaxStep), maxMove);
  const errorScale = Math.max(1e-6, condition.current[0] / Math.max(maxVoltage, 1));
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let direction = 1;
  let adaptiveStep = maximumStep;
  let previousError = errorScale;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, adaptiveStep, positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.vincIterations; iteration += 1) {
    const previousCurrent = current;
    const previousVoltage = measuredVoltage;
    position = clamp(position + direction * adaptiveStep, minVoltage, maxVoltage);
    const measurement = runBoostInterval(condition, position, settings, plant);
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    power = measurement.power;
    duty = measurement.duty;
    const deltaVoltage = measuredVoltage - previousVoltage;
    const deltaCurrent = current - previousCurrent;
    const conductanceError = Math.abs(deltaVoltage) < 1e-9
      ? deltaCurrent
      : deltaCurrent / deltaVoltage + current / Math.max(measuredVoltage, 1e-9);
    if (conductanceError > settings.vincTolerance) direction = 1;
    else if (conductanceError < -settings.vincTolerance) direction = -1;
    else direction = 0;
    const normalizedError = clamp(Math.abs(conductanceError) / errorScale, 0, 1);
    const slopeChange = clamp(Math.abs(conductanceError - previousError) / errorScale, 0, 1);
    const compensation = clamp((1 - Math.min(1, settings.vincCompensation)) * normalizedError
      + Math.min(1, settings.vincCompensation) * normalizedError * slopeChange, 0, 1);
    adaptiveStep = minimumStep + (maximumStep - minimumStep) * compensation;
    if (direction === 0) adaptiveStep = 0;
    previousError = conductanceError;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateMpc(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.mpcVmaxPercent / 100;
  const candidateStep = Math.min(settings.mpcStep, maxMove);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let predictedPower = 0;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, predictedPower, positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.mpcIterations; iteration += 1) {
    const candidates = [...new Set([
      clamp(position - candidateStep, minVoltage, maxVoltage),
      clamp(position, minVoltage, maxVoltage),
      clamp(position + candidateStep, minVoltage, maxVoltage),
    ])];
    let selectedPosition = position;
    let selectedPrediction = -Infinity;
    let lowestCost = Infinity;
    candidates.forEach((candidate) => {
      const forecastPlant = { ...plant };
      let accumulatedPower = 0;
      for (let horizon = 0; horizon < settings.mpcHorizon; horizon += 1) {
        const forecast = runBoostInterval(condition, candidate, settings, forecastPlant);
        accumulatedPower += forecast.power;
      }
      const averagePower = accumulatedPower / settings.mpcHorizon;
      const terminalPower = fitness(condition, candidate);
      const objectivePower = 0.6 * averagePower + 0.4 * terminalPower;
      const normalizedMove = (candidate - position) / Math.max(maxMove, 1e-9);
      const cost = -objectivePower / Math.max(condition.gmpp.power, 1e-9)
        + settings.mpcPenalty * normalizedMove ** 2;
      if (cost < lowestCost) {
        lowestCost = cost;
        selectedPosition = candidate;
        selectedPrediction = averagePower;
      }
    });
    position = selectedPosition;
    predictedPower = selectedPrediction;
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function fuzzyMemberships(value) {
  const centers = [-1, -0.5, 0, 0.5, 1];
  return centers.map((center) => Math.max(0, 1 - Math.abs(clamp(value, -1, 1) - center) / 0.5));
}

function fuzzyVoltageCommand(error, deltaError, settings) {
  const errorMembership = fuzzyMemberships(error * settings.fuzzyErrorGain);
  const deltaMembership = fuzzyMemberships(deltaError * settings.fuzzyDeltaGain);
  const centers = [-1, -0.5, 0, 0.5, 1];
  let weighted = 0;
  let total = 0;
  errorMembership.forEach((errorDegree, errorIndex) => {
    deltaMembership.forEach((deltaDegree, deltaIndex) => {
      const weight = Math.min(errorDegree, deltaDegree);
      const singleton = clamp(centers[errorIndex] + 0.5 * centers[deltaIndex], -1, 1);
      weighted += weight * singleton;
      total += weight;
    });
  });
  return settings.fuzzyStep * (total > 0 ? weighted / total : 0);
}

function simulateFuzzy(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let previousError = 1;
  let command = settings.fuzzyStep;
  let bestPosition = 0;
  let bestPower = 0;
  const slopeScale = condition.gmpp.power / Math.max(1, maxVoltage - minVoltage);

  const snapshot = (iteration, segments = []) => ({
    iteration,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.fuzzyIterations; iteration += 1) {
    const previousPower = power;
    const previousVoltage = measuredVoltage;
    position = clamp(position + command, minVoltage, maxVoltage);
    const measurement = runBoostInterval(condition, position, settings, plant);
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    power = measurement.power;
    duty = measurement.duty;
    const deltaVoltage = measuredVoltage - previousVoltage;
    const slope = Math.abs(deltaVoltage) > 1e-9 ? (power - previousPower) / deltaVoltage : 0;
    const error = clamp(slope / Math.max(slopeScale, 1e-9), -1, 1);
    const deltaError = error - previousError;
    command = fuzzyVoltageCommand(error, deltaError, settings);
    previousError = error;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function neuralCurveFeatures(condition, currentScale) {
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  return [0.15, 0.35, 0.55, 0.75, 0.9].map((fraction) => (
    currentAt(condition, fraction * maxVoltage) / Math.max(currentScale, 1e-9)
  ));
}

function trainCurveNeuralNetwork(conditions, settings) {
  const inputCount = 5;
  const hiddenCount = settings.nnHidden;
  const currentScale = Math.max(...conditions.flatMap((item) => item.current.map((value) => Math.max(0, value))), 1);
  const rawInputs = conditions.map((item) => neuralCurveFeatures(item, currentScale));
  const featureMeans = Array.from({ length: inputCount }, (_, inputIndex) => (
    rawInputs.reduce((sum, input) => sum + input[inputIndex], 0) / rawInputs.length
  ));
  const featureScales = Array.from({ length: inputCount }, (_, inputIndex) => Math.max(1e-4, Math.sqrt(
    rawInputs.reduce((sum, input) => sum + (input[inputIndex] - featureMeans[inputIndex]) ** 2, 0) / rawInputs.length,
  )));
  const normalizeInput = (input) => input.map((value, inputIndex) => (
    (value - featureMeans[inputIndex]) / featureScales[inputIndex]
  ));
  const samples = conditions.map((item, index) => {
    const maxVoltage = item.range.rawMaxVoltage || item.range.maxVoltage;
    return {
      input: normalizeInput(rawInputs[index]),
      target: clamp(item.gmpp.voltage / Math.max(maxVoltage, 1e-9), 0.01, 0.99),
    };
  });
  const weightsOne = Array.from({ length: hiddenCount }, (_, hidden) => (
    Array.from({ length: inputCount }, (_, input) => 0.18 * Math.sin((hidden + 1) * (input + 2) * 1.731))
  ));
  const biasOne = Array.from({ length: hiddenCount }, (_, hidden) => 0.05 * Math.cos((hidden + 1) * 0.91));
  const weightsTwo = Array.from({ length: hiddenCount }, (_, hidden) => 0.12 * Math.sin((hidden + 1) * 2.137));
  let biasTwo = 1;
  const sigmoid = (value) => 1 / (1 + Math.exp(-clamp(value, -30, 30)));
  let loss = Infinity;

  for (let epoch = 0; epoch < settings.nnEpochs; epoch += 1) {
    const gradientOne = Array.from({ length: hiddenCount }, () => Array(inputCount).fill(0));
    const gradientBiasOne = Array(hiddenCount).fill(0);
    const gradientTwo = Array(hiddenCount).fill(0);
    let gradientBiasTwo = 0;
    loss = 0;
    samples.forEach(({ input, target }) => {
      const hidden = weightsOne.map((weights, hiddenIndex) => Math.tanh(
        weights.reduce((sum, weight, inputIndex) => sum + weight * input[inputIndex], biasOne[hiddenIndex]),
      ));
      const prediction = sigmoid(hidden.reduce((sum, value, hiddenIndex) => sum + value * weightsTwo[hiddenIndex], biasTwo));
      const error = prediction - target;
      loss += error ** 2;
      const outputDelta = 2 * error * prediction * (1 - prediction);
      hidden.forEach((value, hiddenIndex) => {
        gradientTwo[hiddenIndex] += outputDelta * value;
        const hiddenDelta = outputDelta * weightsTwo[hiddenIndex] * (1 - value ** 2);
        gradientBiasOne[hiddenIndex] += hiddenDelta;
        input.forEach((inputValue, inputIndex) => { gradientOne[hiddenIndex][inputIndex] += hiddenDelta * inputValue; });
      });
      gradientBiasTwo += outputDelta;
    });
    const learningScale = settings.nnLearningRate / samples.length;
    weightsOne.forEach((weights, hiddenIndex) => {
      weights.forEach((_, inputIndex) => { weightsOne[hiddenIndex][inputIndex] -= learningScale * gradientOne[hiddenIndex][inputIndex]; });
      biasOne[hiddenIndex] -= learningScale * gradientBiasOne[hiddenIndex];
      weightsTwo[hiddenIndex] -= learningScale * gradientTwo[hiddenIndex];
    });
    biasTwo -= learningScale * gradientBiasTwo;
    loss /= samples.length;
  }

  const predict = (item) => {
    const input = normalizeInput(neuralCurveFeatures(item, currentScale));
    const hidden = weightsOne.map((weights, hiddenIndex) => Math.tanh(
      weights.reduce((sum, weight, inputIndex) => sum + weight * input[inputIndex], biasOne[hiddenIndex]),
    ));
    return sigmoid(hidden.reduce((sum, value, hiddenIndex) => sum + value * weightsTwo[hiddenIndex], biasTwo));
  };
  return { predict, loss };
}

function simulateNeuralNetwork(condition, settings) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * settings.nnVmaxPercent / 100;
  const network = trainCurveNeuralNetwork(state.data.conditions, settings);
  const predictedVoltage = clamp(network.predict(condition) * maxVoltage, minVoltage, maxVoltage);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, predictedVoltage, trainingLoss: network.loss,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.nnIterations; iteration += 1) {
    position += clamp(predictedVoltage - position, -maxMove, maxMove);
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function buildCurveLearningDataset(conditions) {
  const inputCount = 5;
  const currentScale = Math.max(...conditions.flatMap((item) => item.current.map((value) => Math.max(0, value))), 1);
  const rawInputs = conditions.map((item) => neuralCurveFeatures(item, currentScale));
  const featureMeans = Array.from({ length: inputCount }, (_, inputIndex) => (
    rawInputs.reduce((sum, input) => sum + input[inputIndex], 0) / rawInputs.length
  ));
  const featureScales = Array.from({ length: inputCount }, (_, inputIndex) => Math.max(1e-4, Math.sqrt(
    rawInputs.reduce((sum, input) => sum + (input[inputIndex] - featureMeans[inputIndex]) ** 2, 0) / rawInputs.length,
  )));
  const normalizeInput = (input) => input.map((value, inputIndex) => (
    (value - featureMeans[inputIndex]) / featureScales[inputIndex]
  ));
  const samples = conditions.map((item, index) => {
    const maxVoltage = item.range.rawMaxVoltage || item.range.maxVoltage;
    return {
      input: normalizeInput(rawInputs[index]),
      target: clamp(item.gmpp.voltage / Math.max(maxVoltage, 1e-9), 0.01, 0.99),
    };
  });
  const inputFor = (item) => normalizeInput(neuralCurveFeatures(item, currentScale));
  return { samples, inputFor };
}

function trainSupportVectorRegressor(conditions, settings) {
  const dataset = buildCurveLearningDataset(conditions);
  const samples = dataset.samples;
  const squaredDistance = (left, right) => left.reduce((sum, value, index) => sum + (value - right[index]) ** 2, 0);
  const kernel = (left, right) => Math.exp(-settings.svrGamma * squaredDistance(left, right));
  const kernelMatrix = samples.map((left) => samples.map((right) => kernel(left.input, right.input)));
  const coefficients = Array(samples.length).fill(0);
  let bias = samples.reduce((sum, sample) => sum + sample.target, 0) / samples.length;
  const firstMoment = Array(samples.length + 1).fill(0);
  const secondMoment = Array(samples.length + 1).fill(0);
  const regularization = 1 / Math.max(settings.svrPenalty, 1e-6);
  const learningRate = 0.035;
  const trainingSteps = 2400;

  for (let step = 1; step <= trainingSteps; step += 1) {
    const kernelProjection = kernelMatrix.map((row) => row.reduce((sum, value, index) => sum + value * coefficients[index], 0));
    const predictions = kernelProjection.map((value) => value + bias);
    const outputGradients = predictions.map((prediction, index) => {
      const residual = prediction - samples[index].target;
      const outside = Math.max(0, Math.abs(residual) - settings.svrEpsilon);
      return outside > 0 ? 2 * Math.sign(residual) * outside / samples.length : 0;
    });
    const gradients = coefficients.map((_, coefficientIndex) => (
      regularization * kernelProjection[coefficientIndex]
      + outputGradients.reduce((sum, gradient, sampleIndex) => sum + gradient * kernelMatrix[sampleIndex][coefficientIndex], 0)
    ));
    gradients.push(outputGradients.reduce((sum, value) => sum + value, 0));
    gradients.forEach((gradient, index) => {
      firstMoment[index] = 0.9 * firstMoment[index] + 0.1 * gradient;
      secondMoment[index] = 0.999 * secondMoment[index] + 0.001 * gradient ** 2;
      const correctedFirst = firstMoment[index] / (1 - 0.9 ** step);
      const correctedSecond = secondMoment[index] / (1 - 0.999 ** step);
      const update = learningRate * correctedFirst / (Math.sqrt(correctedSecond) + 1e-8);
      if (index < coefficients.length) coefficients[index] -= update;
      else bias -= update;
    });
  }

  const predictNormalized = (input) => clamp(
    bias + samples.reduce((sum, sample, index) => sum + coefficients[index] * kernel(sample.input, input), 0),
    0.01,
    0.99,
  );
  const loss = samples.reduce((sum, sample) => sum + (predictNormalized(sample.input) - sample.target) ** 2, 0) / samples.length;
  return { predict: (item) => predictNormalized(dataset.inputFor(item)), loss };
}

function trainRandomForestRegressor(conditions, settings) {
  const dataset = buildCurveLearningDataset(conditions);
  let randomState = 0x45d9f3b;
  const random = () => {
    randomState = Math.imul(randomState ^ (randomState >>> 16), 0x45d9f3b);
    randomState = Math.imul(randomState ^ (randomState >>> 16), 0x45d9f3b);
    randomState ^= randomState >>> 16;
    return (randomState >>> 0) / 4294967296;
  };
  const augmented = dataset.samples.flatMap((sample) => Array.from({ length: 10 }, () => ({
    input: sample.input.map((value) => value + (random() - 0.5) * 0.018),
    target: sample.target,
  })));
  const meanTarget = (samples) => samples.reduce((sum, sample) => sum + sample.target, 0) / Math.max(1, samples.length);
  const squaredError = (samples) => {
    const mean = meanTarget(samples);
    return samples.reduce((sum, sample) => sum + (sample.target - mean) ** 2, 0);
  };
  const buildTree = (samples, depth) => {
    if (depth >= settings.rfDepth || samples.length < 4 || squaredError(samples) < 1e-10) return { value: meanTarget(samples) };
    const featureOrder = [0, 1, 2, 3, 4].sort(() => random() - 0.5);
    const featureCount = Math.max(1, Math.ceil(Math.sqrt(5)));
    let best = null;
    featureOrder.slice(0, featureCount).forEach((feature) => {
      const values = [...new Set(samples.map((sample) => sample.input[feature]).sort((a, b) => a - b))];
      for (let index = 0; index < values.length - 1; index += 1) {
        const threshold = (values[index] + values[index + 1]) / 2;
        const left = samples.filter((sample) => sample.input[feature] <= threshold);
        const right = samples.filter((sample) => sample.input[feature] > threshold);
        if (!left.length || !right.length) continue;
        const score = squaredError(left) + squaredError(right);
        if (!best || score < best.score) best = { feature, threshold, left, right, score };
      }
    });
    if (!best) return { value: meanTarget(samples) };
    return {
      feature: best.feature,
      threshold: best.threshold,
      left: buildTree(best.left, depth + 1),
      right: buildTree(best.right, depth + 1),
    };
  };
  const sampleCount = Math.max(3, Math.round(augmented.length * settings.rfSampleRatio / 100));
  const trees = Array.from({ length: settings.rfTrees }, () => buildTree(
    Array.from({ length: sampleCount }, () => augmented[Math.floor(random() * augmented.length)]),
    0,
  ));
  const predictTree = (tree, input) => {
    let node = tree;
    while (node.value === undefined) node = input[node.feature] <= node.threshold ? node.left : node.right;
    return node.value;
  };
  const predictNormalized = (input) => clamp(
    trees.reduce((sum, tree) => sum + predictTree(tree, input), 0) / trees.length,
    0.01,
    0.99,
  );
  const loss = dataset.samples.reduce((sum, sample) => sum + (predictNormalized(sample.input) - sample.target) ** 2, 0) / dataset.samples.length;
  return { predict: (item) => predictNormalized(dataset.inputFor(item)), loss };
}

function simulateRegressionModel(condition, settings, model, vmaxPercent, iterations) {
  const minVoltage = condition.range.minVoltage;
  const maxVoltage = condition.range.rawMaxVoltage || condition.range.maxVoltage;
  const maxMove = (maxVoltage - minVoltage) * vmaxPercent / 100;
  const predictedVoltage = clamp(model.predict(condition) * maxVoltage, minVoltage, maxVoltage);
  const plant = createBoostPlant();
  const history = [];
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  const snapshot = (iteration, segments = []) => ({
    iteration, predictedVoltage, trainingLoss: model.loss,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    position += clamp(predictedVoltage - position, -maxMove, maxMove);
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulateSvr(condition, settings) {
  return simulateRegressionModel(
    condition,
    settings,
    trainSupportVectorRegressor(state.data.conditions, settings),
    settings.svrVmaxPercent,
    settings.svrIterations,
  );
}

function simulateRandomForest(condition, settings) {
  return simulateRegressionModel(
    condition,
    settings,
    trainRandomForestRegressor(state.data.conditions, settings),
    settings.rfVmaxPercent,
    settings.rfIterations,
  );
}

function trainQlearningPolicies(conditions, settings) {
  let randomState = 0x6d2b79f5;
  const random = () => {
    randomState = (randomState + 0x6d2b79f5) | 0;
    let value = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const actionOffsets = [-1, 0, 1];
  const policies = conditions.map((trainingCondition) => {
    const maxVoltage = trainingCondition.range.rawMaxVoltage || trainingCondition.range.maxVoltage;
    const binCount = Math.max(3, Math.round(maxVoltage / settings.rlStep) + 1);
    const voltageStep = maxVoltage / (binCount - 1);
    const qTable = Array.from({ length: binCount }, () => [0, 0, 0]);
    const episodeLength = Math.min(240, Math.max(40, binCount * 3));
    const chooseGreedyAction = (stateBin) => {
      const values = qTable[stateBin];
      let bestIndex = 0;
      let bestValue = -Infinity;
      values.forEach((value, actionIndex) => {
        const nextBin = clamp(stateBin + actionOffsets[actionIndex], 0, binCount - 1);
        const immediatePower = fitness(trainingCondition, nextBin * voltageStep);
        const score = value + 1e-8 * immediatePower;
        if (score > bestValue) { bestValue = score; bestIndex = actionIndex; }
      });
      return bestIndex;
    };
    const updateTransition = (stateBin, actionIndex) => {
      const nextBin = clamp(stateBin + actionOffsets[actionIndex], 0, binCount - 1);
      const normalizedPower = clamp(fitness(trainingCondition, nextBin * voltageStep) / 600, 0, 1);
      const movementPenalty = 0.001 * Math.abs(actionOffsets[actionIndex]);
      const reward = Math.expm1(4 * normalizedPower) - movementPenalty;
      const nextMaximum = Math.max(...qTable[nextBin]);
      const current = qTable[stateBin][actionIndex];
      qTable[stateBin][actionIndex] = current + settings.rlLearningRate
        * (reward + settings.rlDiscount * nextMaximum - current);
      return nextBin;
    };

    for (let episode = 0; episode < settings.rlEpisodes; episode += 1) {
      let stateBin = Math.floor(random() * binCount);
      const epsilon = Math.max(0.01, settings.rlExploration * (1 - episode / settings.rlEpisodes));
      for (let stepIndex = 0; stepIndex < episodeLength; stepIndex += 1) {
        const actionIndex = random() < epsilon ? Math.floor(random() * 3) : chooseGreedyAction(stateBin);
        stateBin = updateTransition(stateBin, actionIndex);
      }
      if (episode % 5 === 0) {
        for (let replayState = binCount - 1; replayState >= 0; replayState -= 1) {
          for (let actionIndex = 0; actionIndex < actionOffsets.length; actionIndex += 1) {
            updateTransition(replayState, actionIndex);
          }
        }
      }
    }
    return { qTable, binCount, voltageStep, maxVoltage, chooseGreedyAction };
  });
  return policies;
}

function simulateReinforcementLearning(condition, settings) {
  const conditionIndex = Math.max(0, state.data.conditions.indexOf(condition));
  const policy = trainQlearningPolicies(state.data.conditions, settings)[conditionIndex];
  const plant = createBoostPlant();
  const history = [];
  const actionOffsets = [-1, 0, 1];
  let stateBin = 0;
  let position = 0;
  let power = 0;
  let current = 0;
  let measuredVoltage = 0;
  let duty = boostModel.dutyMax;
  let bestPosition = 0;
  let bestPower = 0;
  let selectedAction = 1;
  const snapshot = (iteration, segments = []) => ({
    iteration, selectedAction, trainingEpisodes: settings.rlEpisodes,
    positions: [position], referencePowers: [fitness(condition, position)], powers: [power],
    currents: [current], actualVoltages: [measuredVoltage], duties: [duty],
    bestPositions: [bestPosition], bestPowers: [bestPower],
    globalBestPosition: bestPosition, globalBestPower: bestPower,
    actualVoltage: plant.pvVoltage,
    actualPower: plant.pvVoltage * Math.max(0, currentAt(condition, plant.pvVoltage)),
    boostSegments: segments,
  });
  history.push(snapshot(0));
  for (let iteration = 1; iteration <= settings.rlIterations; iteration += 1) {
    const actionIndex = policy.chooseGreedyAction(stateBin);
    selectedAction = actionOffsets[actionIndex];
    stateBin = clamp(stateBin + selectedAction, 0, policy.binCount - 1);
    position = stateBin * policy.voltageStep;
    const measurement = runBoostInterval(condition, position, settings, plant);
    power = measurement.power;
    current = measurement.current;
    measuredVoltage = measurement.voltage;
    duty = measurement.duty;
    if (power > bestPower) { bestPower = power; bestPosition = position; }
    history.push(snapshot(iteration, [measurement]));
  }
  return history;
}

function simulate() {
  const condition = state.data.conditions[state.conditionIndex];
  const settings = params();
  const simulators = {
    po: simulatePo,
    hc: simulateHillClimb,
    vpo: simulateVariablePo,
    jeinc: simulateJeinc,
    cvt: simulateCvt,
    focv: simulateFocv,
    scan: simulateVoltageScan,
    esc: simulateEsc,
    pso: simulatePso,
    sa: simulateSa,
    ga: simulateGa,
    cs: simulateCs,
    abc: simulateAbc,
    afsa: simulateAfsa,
    de: simulateDe,
    inc: simulateInc,
    vinc: simulateVariableInc,
    mpc: simulateMpc,
    fuzzy: simulateFuzzy,
    nn: simulateNeuralNetwork,
    svr: simulateSvr,
    rf: simulateRandomForest,
    rl: simulateReinforcementLearning,
    dqn: (c, s) => simulateLearningController(c, s, 'dqn'),
    sac: (c, s) => simulateLearningController(c, s, 'sac'),
    pso_po: (c, s) => simulateHybridPopulation(c, s, 'pso_po'),
    ga_po: (c, s) => simulateHybridPopulation(c, s, 'ga_po'),
    ga_fuzzy: (c, s) => simulateHybridPopulation(c, s, 'ga_fuzzy'),
    ga_ann: simulateGaAnnHybrid,
  };
  state.history = simulators[state.algorithm](condition, settings);
  state.currentIteration = 0;
  $('#timeline').max = state.history.length - 1;
  $('#timeline').value = 0;
  $('#downloadButton').disabled = false;
  setSimulationReady(true);
  renderParticleLegend(state.history[0].positions.length);
  render();
}

function setSimulationReady(ready) {
  $('#previousButton').disabled = !ready;
  $('#playButton').disabled = !state.data;
  $('#nextButton').disabled = !ready;
  $('#timeline').disabled = !ready;
  updatePlaybackUi();
}

function updatePlaybackUi() {
  const content = localizedAlgorithmContent();
  const hasRemainingFrames = state.history.length > 0 && state.currentIteration < state.history.length - 1;
  const runIcon = $('#runButton .play-icon');
  $('#playButton').textContent = state.playing ? '❚❚' : '▶';
  if (runIcon) runIcon.textContent = state.playing ? '❚❚' : '▶';
  $('#runButtonLabel').textContent = state.playing
    ? `${tr('pause')} ${content.shortName}`
    : hasRemainingFrames
      ? `${tr('continue')} ${content.shortName}`
      : content.runLabel;
  $('#runButton').setAttribute('aria-label', state.playing ? `${tr('pause')} ${content.shortName}` : `${tr('runOrContinue')} ${content.shortName}`);
}

function plannedIterations() {
  const settings = params();
  return settings[algorithmContent[state.algorithm].iterationKey];
}

function invalidateSimulation() {
  if (!state.data) return;
  stopPlayback();
  state.history = [];
  state.currentIteration = 0;
  $('#timeline').max = plannedIterations();
  $('#timeline').value = 0;
  $('#particleLegend').innerHTML = '';
  $('#downloadButton').disabled = true;
  setSimulationReady(false);
  render();
}

function renderParticleLegend(count) {
  const legend = $('#particleLegend');
  const content = localizedAlgorithmContent();
  const labels = content.population
    ? Array.from({ length: count }, (_, index) => `${content.entityPrefix || tr('candidate')}${index + 1}`)
    : [`${content.shortName} ${tr('workPoint')}`];
  legend.innerHTML = labels.map((label, index) =>
    `<span><i style="background:${particleColors[index % particleColors.length]}"></i>${label}</span>`).join('');
}

function startPlayback() {
  if (!state.history.length) {
    simulate();
  }
  if (state.currentIteration >= state.history.length - 1) state.currentIteration = 0;
  state.playing = true;
  updatePlaybackUi();
  clearInterval(state.timer);
  const delay = Number($('#speed').value);
  state.timer = setInterval(() => {
    if (state.currentIteration >= state.history.length - 1) {
      stopPlayback();
      showToast(`${algorithmContent[state.algorithm].shortName} ${tr('complete')}`);
      return;
    }
    state.currentIteration += 1;
    render();
  }, delay);
}

function stopPlayback() {
  state.playing = false;
  clearInterval(state.timer);
  state.timer = null;
  updatePlaybackUi();
}

function runAndPlay() {
  stopPlayback();
  simulate();
  startPlayback();
  showToast(state.language === 'en' ? `${tr('ranWithParameters')} ${algorithmContent[state.algorithm].shortName}` : `${tr('ranWithParameters')} ${algorithmContent[state.algorithm].shortName}`);
}

function toggleRunButton() {
  if (state.playing) {
    stopPlayback();
    showToast(`${algorithmContent[state.algorithm].shortName} ${tr('paused')}`);
  } else if (state.history.length && state.currentIteration < state.history.length - 1) {
    startPlayback();
  } else {
    runAndPlay();
  }
}

function toggleProgressPlayback() {
  if (state.playing) {
    stopPlayback();
  } else if (state.history.length) {
    startPlayback();
  } else {
    runAndPlay();
  }
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const parentRect = canvas.parentElement?.getBoundingClientRect();
  const cssWidth = rect.width || canvas.clientWidth || parentRect?.width || 640;
  const cssHeight = rect.height || canvas.clientHeight || parentRect?.height || 320;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: cssWidth, height: cssHeight };
}

function drawAxes(ctx, width, height, ranges, labels) {
  const pad = { left: 58, right: 22, top: 14, bottom: 43 };
  const plot = { x: pad.left, y: pad.top, width: width - pad.left - pad.right, height: height - pad.top - pad.bottom };
  const xScale = (x) => plot.x + (x - ranges.xMin) / (ranges.xMax - ranges.xMin) * plot.width;
  const yScale = (y) => plot.y + plot.height - (y - ranges.yMin) / (ranges.yMax - ranges.yMin) * plot.height;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '10px "Times New Roman", Microsoft YaHei, serif';
  ctx.fillStyle = '#637472';
  ctx.strokeStyle = '#e1e4dc';
  ctx.lineWidth = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 5; i += 1) {
    const xValue = ranges.xMin + (ranges.xMax - ranges.xMin) * i / 5;
    const x = xScale(xValue);
    ctx.beginPath(); ctx.moveTo(x, plot.y); ctx.lineTo(x, plot.y + plot.height); ctx.stroke();
    ctx.fillText(format(xValue, ranges.xMax <= 100 ? 0 : 1), x, plot.y + plot.height + 9);
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 5; i += 1) {
    const yValue = ranges.yMin + (ranges.yMax - ranges.yMin) * i / 5;
    const y = yScale(yValue);
    ctx.beginPath(); ctx.moveTo(plot.x, y); ctx.lineTo(plot.x + plot.width, y); ctx.stroke();
    ctx.fillText(format(yValue, ranges.yDigits ?? 0), plot.x - 9, y);
  }
  ctx.strokeStyle = '#8a9693';
  ctx.beginPath(); ctx.moveTo(plot.x, plot.y); ctx.lineTo(plot.x, plot.y + plot.height); ctx.lineTo(plot.x + plot.width, plot.y + plot.height); ctx.stroke();
  ctx.fillStyle = '#314845';
  ctx.font = '600 14px "Times New Roman", Microsoft YaHei, serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText(labels.x, plot.x + plot.width / 2, height - 3);
  ctx.save(); ctx.translate(18, plot.y + plot.height / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(labels.y, 0, 0); ctx.restore();
  return { plot, xScale, yScale };
}

function renderArrayConditionLegend() {
  const legend = $('#currentLegend');
  if (!legend) return;
  const irradiances = conditionIrradiancePatterns[state.conditionIndex] || conditionIrradiancePatterns[0];
  legend.innerHTML = irradiances.map((irradiance, index) =>
    `<span><i class="irradiance-chip" style="--irradiance-color:${irradianceColors[irradiance]}"></i>PV${index + 1} ${irradiance} W/m²</span>`).join('');
  legend.setAttribute('aria-label', `${tr('condition')} ${state.conditionIndex + 1}: ${irradiances.map((value, index) => `PV${index + 1} ${value} W/m²`).join(', ')}`);
}

function drawIuChart() {
  const canvas = $('#iuChart');
  const { ctx, width, height } = setupCanvas(canvas);
  renderArrayConditionLegend();
  ctx.fillStyle = '#fffdf6';
  ctx.fillRect(0, 0, width, height);
  if (!systemDiagramImage.complete || !systemDiagramImage.naturalWidth) {
    ctx.fillStyle = '#63736f';
    ctx.font = '600 13px "Times New Roman", Microsoft YaHei, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.language === 'en' ? 'Loading system diagram…' : '正在加载系统架构图…', width / 2, height / 2);
    return;
  }

  const sourceWidth = systemDiagramImage.naturalWidth;
  const sourceHeight = systemDiagramImage.naturalHeight;
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(systemDiagramImage, offsetX, offsetY, drawWidth, drawHeight);

  const modulePolygons = [
    [[140, 290], [255, 291], [239, 396], [124, 394]],
    [[140, 423], [255, 425], [239, 529], [124, 527]],
    [[140, 554], [255, 556], [239, 660], [124, 658]],
    [[140, 686], [255, 688], [239, 792], [124, 790]],
  ];
  const shadeOpacity = { 800: 0.18, 600: 0.34, 400: 0.52 };
  const irradiances = conditionIrradiancePatterns[state.conditionIndex] || conditionIrradiancePatterns[0];
  irradiances.forEach((irradiance, index) => {
    if (irradiance >= 1000) return;
    const polygon = modulePolygons[index];
    ctx.save();
    ctx.beginPath();
    polygon.forEach(([x, y], pointIndex) => {
      const canvasX = offsetX + x * scale;
      const canvasY = offsetY + y * scale;
      if (pointIndex === 0) ctx.moveTo(canvasX, canvasY); else ctx.lineTo(canvasX, canvasY);
    });
    ctx.closePath();
    ctx.clip();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = shadeOpacity[irradiance] || 0;
    ctx.fillStyle = irradianceColors[irradiance] || '#064723';
    ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  });
}

function drawPuChart() {
  const canvas = $('#puChart');
  const { ctx, width, height } = setupCanvas(canvas);
  const condition = state.data.conditions[state.conditionIndex];
  const chartMaxVoltage = Math.max(...state.data.conditions.map((item) => item.range.rawMaxVoltage));
  const { plot, xScale, yScale } = drawAxes(ctx, width, height, {
    xMin: 0, xMax: chartMaxVoltage, yMin: 0, yMax: 600,
  }, { x: tr('voltageAxis'), y: tr('powerAxis') });

  ctx.save();
  ctx.beginPath(); ctx.rect(plot.x, plot.y, plot.width, plot.height); ctx.clip();
  const curveOrder = state.data.conditions
    .map((item, index) => ({ item, index }))
    .sort((a, b) => Number(a.index === state.conditionIndex) - Number(b.index === state.conditionIndex));
  curveOrder.forEach(({ item, index: conditionIndex }) => {
    ctx.beginPath();
    item.voltage.forEach((u, index) => {
      const x = xScale(u); const y = yScale(Math.max(0, item.power[index]));
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    const selected = conditionIndex === state.conditionIndex;
    ctx.strokeStyle = selected ? '#0e6b56' : 'rgba(126,137,134,.48)';
    ctx.lineWidth = selected ? 2.8 : 1.45;
    ctx.lineJoin = 'round';
    ctx.stroke();
  });

  const frame = state.history[state.currentIteration];
  if (frame) {
    if (state.algorithm === 'pso') {
      frame.bestPositions.forEach((u) => {
        ctx.beginPath(); ctx.arc(xScale(u), yScale(fitness(condition, u)), 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(102,87,217,.28)'; ctx.lineWidth = 1.3; ctx.stroke();
      });
    }
    frame.positions.forEach((u, index) => {
      const x = xScale(u); const y = yScale(fitness(condition, u));
      const isMoving = Boolean(algorithmContent[state.algorithm].population) && frame.movedParticleIndex === index;
      ctx.beginPath(); ctx.arc(x, y, isMoving ? 6.2 : 4.3, 0, Math.PI * 2);
      ctx.fillStyle = algorithmContent[state.algorithm].population ? particleColors[index % particleColors.length] : 'rgba(243,109,50,.78)'; ctx.fill();
      ctx.strokeStyle = '#fffdf6'; ctx.lineWidth = 1.4; ctx.stroke();
      if (isMoving) {
        ctx.beginPath(); ctx.arc(x, y, 9.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(243,109,50,.75)'; ctx.lineWidth = 1.6; ctx.stroke();
      }
    });
    if (algorithmContent[state.algorithm].tracksBest) {
      const gx = xScale(frame.globalBestPosition); const gy = yScale(fitness(condition, frame.globalBestPosition));
      ctx.beginPath(); ctx.arc(gx, gy, 8, 0, Math.PI * 2); ctx.fillStyle = '#6657d9'; ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
    }
    const actualX = xScale(frame.actualVoltage || 0);
    const actualY = yScale(frame.actualPower || 0);
    ctx.beginPath(); ctx.arc(actualX, actualY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf6'; ctx.fill(); ctx.strokeStyle = '#f36d32'; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(actualX - 3.5, actualY); ctx.lineTo(actualX + 3.5, actualY);
    ctx.moveTo(actualX, actualY - 3.5); ctx.lineTo(actualX, actualY + 3.5);
    ctx.strokeStyle = '#f36d32'; ctx.lineWidth = 1.4; ctx.stroke();
  }
  const mx = xScale(condition.gmpp.voltage); const my = yScale(condition.gmpp.power);
  ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.strokeStyle = '#00a6a6'; ctx.lineWidth = 2.3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(mx - 4, my); ctx.lineTo(mx + 4, my); ctx.moveTo(mx, my - 4); ctx.lineTo(mx, my + 4); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#00a6a6'; ctx.font = '700 14px "Times New Roman", Microsoft YaHei, serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
  ctx.fillText(`GMPP  ${format(condition.gmpp.voltage)} V / ${format(condition.gmpp.power)} W`, Math.min(width - 20, mx - 8), Math.max(18, my - 9));
}

function drawConvergenceChart() {
  const canvas = $('#convergenceChart');
  const { ctx, width, height } = setupCanvas(canvas);
  const xMax = Math.max(1, state.history.length - 1 || plannedIterations());
  const xLabel = tr('iterationAxis');
  const yLabel = algorithmContent[state.algorithm].population ? tr('candidatePowerAxis') : tr('workPowerAxis');
  const { plot, xScale, yScale } = drawAxes(ctx, width, height, { xMin: 0, xMax, yMin: 0, yMax: 600 }, { x: xLabel, y: yLabel });
  if (!state.history.length) {
    ctx.fillStyle = '#71807d'; ctx.font = '600 13px "Times New Roman", Microsoft YaHei, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.language === 'en' ? 'Run the selected algorithm to generate a trajectory' : '点击“运行”生成功率轨迹', plot.x + plot.width / 2, plot.y + plot.height / 2);
  }
  ctx.save(); ctx.beginPath(); ctx.rect(plot.x, plot.y, plot.width, plot.height); ctx.clip();
  if (state.history.length) {
    const current = state.history[state.currentIteration];
    current.powers.forEach((_, particleIndex) => {
      ctx.beginPath();
      state.history.slice(0, state.currentIteration + 1).forEach((frame, frameIndex) => {
        const x = xScale(frame.iteration);
        const y = yScale(Math.max(0, Math.min(600, frame.powers[particleIndex])));
        if (frameIndex === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = particleColors[particleIndex % particleColors.length];
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(xScale(current.iteration), yScale(current.powers[particleIndex]), 3.6, 0, Math.PI * 2);
      ctx.fillStyle = particleColors[particleIndex % particleColors.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }
  ctx.restore();
}

function buildOutputWaveform() {
  const settings = params();
  const segments = [];
  const frameEndTimes = [];
  const frameSlotCounts = [];
  state.history.forEach((frame) => {
    segments.push(...(frame.boostSegments || []));
    const lastSegment = segments[segments.length - 1];
    const lastSample = lastSegment?.samples?.[lastSegment.samples.length - 1];
    frameEndTimes.push(lastSample?.timeMs ?? 0);
    frameSlotCounts.push(segments.length);
  });
  const samples = segments.flatMap((segment) => segment.samples || []);
  return {
    times: [0, ...samples.map((sample) => sample.timeMs)],
    outputs: [0, ...samples.map((sample) => sample.pvPower)],
    commands: [0, ...samples.map((sample) => sample.referencePower)],
    voltages: [0, ...samples.map((sample) => sample.pvVoltage)],
    duties: [boostModel.dutyMax, ...samples.map((sample) => sample.duty)],
    updateTimeMs: settings.updateTimeMs,
    initialSlotCount: state.history[0]?.boostSegments?.length ?? 0,
    frameEndTimes,
    frameSlotCounts,
  };
}

function drawOutputPowerChart() {
  const canvas = $('#outputPowerChart');
  const { ctx, width, height } = setupCanvas(canvas);
  const waveform = buildOutputWaveform();
  const visibleSlotCount = waveform.frameSlotCounts[state.currentIteration] ?? 0;
  const visibleEnd = waveform.frameEndTimes[state.currentIteration] ?? 0;
  let lastIndex = waveform.times.findIndex((time) => time > visibleEnd);
  if (lastIndex < 0) lastIndex = waveform.times.length;
  const xMax = Math.max(waveform.updateTimeMs, waveform.times[waveform.times.length - 1]);
  canvas.dataset.yMin = '0';
  canvas.dataset.yMax = '600';
  canvas.dataset.initialScanSlots = String(waveform.initialSlotCount);
  canvas.dataset.visibleSlots = String(visibleSlotCount);
  const { plot, xScale, yScale } = drawAxes(ctx, width, height, {
    xMin: 0, xMax, yMin: 0, yMax: 600,
  }, { x: tr('timeAxis'), y: tr('powerAxis') });

  if (!state.history.length) {
    ctx.fillStyle = '#71807d'; ctx.font = '600 13px "Times New Roman", Microsoft YaHei, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.language === 'en' ? 'Run the selected algorithm to generate a waveform' : '点击“运行”生成输出功率波形', plot.x + plot.width / 2, plot.y + plot.height / 2);
  }

  ctx.save();
  ctx.beginPath(); ctx.rect(plot.x, plot.y, plot.width, plot.height); ctx.clip();
  const drawSeries = (values, color, dashed = false) => {
    ctx.beginPath();
    for (let index = 0; index < lastIndex; index += 1) {
      const x = xScale(waveform.times[index]);
      const yPoint = yScale(Math.max(0, Math.min(600, values[index])));
      if (index === 0) ctx.moveTo(x, yPoint); else ctx.lineTo(x, yPoint);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = dashed ? 1.4 : 2.2;
    ctx.setLineDash(dashed ? [5, 4] : []);
    ctx.stroke();
  };
  drawSeries(waveform.commands, '#ef7b35', true);
  drawSeries(waveform.outputs, '#0e6b56');
  ctx.setLineDash([]);
  const cursorTime = Math.min(xMax, visibleSlotCount * waveform.updateTimeMs);
  ctx.beginPath(); ctx.moveTo(xScale(cursorTime), plot.y); ctx.lineTo(xScale(cursorTime), plot.y + plot.height);
  ctx.strokeStyle = 'rgba(102,87,217,.6)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function renderMetrics() {
  const current = state.history[state.currentIteration];
  const total = Math.max(0, state.history.length ? state.history.length - 1 : plannedIterations());
  $('#metricIteration').innerHTML = `${state.currentIteration} <small>/ ${total}</small>`;
  if (!current) {
    $('#metricVoltage').innerHTML = `— <small>V</small>`;
    $('#metricPower').innerHTML = `— <small>W</small>`;
    $('#metricEfficiency').innerHTML = `— <small>%</small>`;
    $('#timeline').value = 0;
    return;
  }
  const condition = state.data.conditions[state.conditionIndex];
  const showBest = algorithmContent[state.algorithm].tracksBest;
  const displayedVoltage = showBest ? current.globalBestPosition : current.positions[0];
  const displayedPower = showBest ? current.globalBestPower : current.powers[0];
  const efficiency = Math.min(100, displayedPower / condition.gmpp.power * 100);
  $('#metricVoltage').innerHTML = `${format(displayedVoltage)} <small>V</small>`;
  $('#metricPower').innerHTML = `${format(displayedPower)} <small>W</small>`;
  $('#metricEfficiency').innerHTML = `${format(efficiency)} <small>%</small>`;
  $('#timeline').value = state.currentIteration;
}

function render() {
  if (!state.data) return;
  drawIuChart();
  drawPuChart();
  drawConvergenceChart();
  drawOutputPowerChart();
  renderMetrics();
}

function queueCanvasRender() {
  if (!state.data) return;
  cancelAnimationFrame(renderFrameHandle);
  renderFrameHandle = requestAnimationFrame(() => {
    renderFrameHandle = requestAnimationFrame(render);
  });
}

function installCanvasResizeObserver() {
  if (!('ResizeObserver' in window) || canvasResizeObserver) return;
  canvasResizeObserver = new ResizeObserver(() => queueCanvasRender());
  document.querySelectorAll('.canvas-wrap').forEach((wrapper) => canvasResizeObserver.observe(wrapper));
}

function downloadCsv() {
  if (!state.history.length) return;
  const condition = state.data.conditions[state.conditionIndex];
  const rows = ['iteration,moved_particle_id,particle_id,reference_voltage,reference_power,measured_pv_voltage,measured_pv_current,measured_pv_power,duty,pbest_voltage,pbest_power,gbest_voltage,gbest_power'];
  state.history.forEach((frame) => {
    frame.positions.forEach((position, index) => rows.push([
      frame.iteration,
      frame.movedParticleIndex == null ? '' : frame.movedParticleIndex + 1,
      index + 1,
      position,
      frame.referencePowers?.[index] ?? fitness(condition, position),
      frame.actualVoltages?.[index] ?? 0,
      frame.currents[index],
      frame.powers[index],
      frame.duties?.[index] ?? '',
      frame.bestPositions[index],
      frame.bestPowers[index],
      frame.globalBestPosition,
      frame.globalBestPower,
    ].join(',')));
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${condition.id}-${state.algorithm}-results.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function populateAlgorithmSelect(category, preferredAlgorithm) {
  const algorithms = algorithmGroups[category] || algorithmGroups.traditional;
  const selectedAlgorithm = algorithms.includes(preferredAlgorithm) ? preferredAlgorithm : algorithms[0];
  controls.algorithmSelect.innerHTML = '';
  algorithms.forEach((algorithm) => {
    const option = document.createElement('option');
    option.value = algorithm;
    option.textContent = localizedAlgorithmLabel(algorithm);
    controls.algorithmSelect.appendChild(option);
  });
  controls.algorithmSelect.value = selectedAlgorithm;
  state.algorithm = selectedAlgorithm;
}

let parameterHelpReturnFocus = null;

function parameterNameForGuide(field) {
  const container = field.closest('.parameter, .distribution-field');
  const namedElement = container?.querySelector('b') || container?.querySelector(':scope > span');
  return namedElement?.innerHTML || field.id;
}

function renderParameterHelp() {
  const modal = $('#parameterHelpModal');
  if (!modal) return;
  const copy = parameterGuideUi[state.language];
  const panel = $(`#${state.algorithm}Parameters`);
  const fields = panel ? [...panel.querySelectorAll('input[type="range"], select')] : [];
  $('#parameterHelpTitle').textContent = `${localizedAlgorithmLabel(state.algorithm)} · ${copy.titleSuffix}`;
  $('#parameterHelpDisclaimer').textContent = copy.disclaimer;
  $('#parameterHelpReferencesTitle').textContent = copy.references;
  const closeButton = $('#parameterHelpClose');
  closeButton.setAttribute('aria-label', copy.close);
  closeButton.title = copy.close;
  $('#parameterHelpList').innerHTML = fields.map((field) => {
    const profile = parameterGuideProfiles[parameterGuideProfileByInput[field.id]];
    if (!profile) return '';
    const [definition, increase, decrease] = profile[state.language];
    const increaseLabel = profile.mode === 'choice' ? copy.random : copy.increase;
    const decreaseLabel = profile.mode === 'choice' ? copy.uniform : copy.decrease;
    return `<article class="parameter-help-item"><h3>${parameterNameForGuide(field)}</h3><dl><div><dt>${copy.definition}</dt><dd>${definition}</dd></div><div><dt>${increaseLabel}</dt><dd>${increase}</dd></div><div><dt>${decreaseLabel}</dt><dd>${decrease}</dd></div></dl></article>`;
  }).join('');
  const references = parameterGuideReferences[state.algorithm] || [];
  $('#parameterHelpReferenceList').innerHTML = references.map((reference) => `<li><a href="${reference.url}" target="_blank" rel="noopener noreferrer">${reference.citation}</a></li>`).join('');
  $('#parameterHelpReferences').hidden = references.length === 0;
}

function openParameterHelp() {
  const modal = $('#parameterHelpModal');
  parameterHelpReturnFocus = document.activeElement;
  renderParameterHelp();
  modal.hidden = false;
  document.body.classList.add('parameter-help-open');
  $('#parameterHelpClose').focus();
}

function closeParameterHelp() {
  const modal = $('#parameterHelpModal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('parameter-help-open');
  if (parameterHelpReturnFocus instanceof HTMLElement) parameterHelpReturnFocus.focus();
}

function updateAlgorithmUi() {
  const content = localizedAlgorithmContent();
  $('#algorithmDescription').textContent = content.description;
  const experimentTitle = $('#experimentTitle');
  if (experimentTitle) experimentTitle.textContent = content.title;
  $('#formulaLabelOne').textContent = content.formulaLabelOne;
  $('#formulaOne').innerHTML = content.formulaOne;
  $('#formulaLabelTwo').textContent = content.formulaLabelTwo;
  $('#formulaTwo').innerHTML = content.formulaTwo;
  $('#powerChartTitle').textContent = content.chartTitle;
  Object.keys(algorithmContent).forEach((algorithm) => {
    const parameterPanel = $(`#${algorithm}Parameters`);
    const iterationParameter = $(`#${algorithm}IterationParameter`);
    if (parameterPanel) parameterPanel.hidden = state.algorithm !== algorithm;
    if (iterationParameter) iterationParameter.hidden = state.algorithm !== algorithm;
  });
  const machineLearningNote = $('#machineLearningNote');
  const isMachineLearning = algorithmGroups.machine_learning.includes(state.algorithm) || state.algorithm === 'ga_ann';
  if (machineLearningNote) machineLearningNote.hidden = !isMachineLearning;
  $('#controlPanel')?.classList.toggle('machine-learning-active', isMachineLearning);
  $('#metricIterationLabel').textContent = tr('currentIteration');
  $('#metricVoltageLabel').textContent = content.tracksBest ? tr('bestVoltage') : tr('workVoltage');
  $('#metricPowerLabel').textContent = content.tracksBest ? tr('bestPower') : tr('workPower');
  const curveLegend = `<span><i class="curve-current-line"></i>${tr('currentCondition')}</span><span><i class="curve-muted-line"></i>${tr('otherConditions')}</span>`;
  const actualLegend = `<span><i class="dot actual-dot"></i>${tr('actualBoost')}</span>`;
  renderArrayConditionLegend();
  const referenceLabel = content.population ? tr('candidate') : `${content.shortName} ${tr('referencePoint')}`;
  const bestLegend = content.tracksBest ? `<span><i class="dot best-dot"></i>${tr('currentBest')}</span>` : '';
  $('#searchLegend').innerHTML = `${curveLegend}<span><i class="dot particle-dot"></i>${referenceLabel}</span>${actualLegend}${bestLegend}<span><i class="dot gmpp-dot"></i>GMPP</span>`;
  if (!$('#parameterHelpModal')?.hidden) renderParameterHelp();
  updatePlaybackUi();
}

function applyLanguage(announce = false) {
  const isEnglish = state.language === 'en';
  document.documentElement.lang = isEnglish ? 'en' : 'zh-CN';
  document.title = isEnglish ? 'PV·LAB · Photovoltaic MPPT Algorithm Visualizer' : 'PV·LAB · 光伏 MPPT 算法可视化平台';
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = isEnglish
    ? 'Visualize the search and tracking behavior of photovoltaic MPPT algorithms on measured I–U and P–U curves.'
    : '在真实 I–U 与 P–U 曲线上可视化多种光伏 MPPT 算法的搜索与跟踪过程。';
  applyStaticTranslations();

  const toggle = $('#languageToggle');
  toggle.innerHTML = isEnglish ? '<strong>中</strong><i></i><span>EN</span>' : '<span>中</span><i></i><strong>EN</strong>';
  toggle.setAttribute('aria-label', tr('switchLanguage'));
  toggle.title = tr('switchLanguage');

  const aria = isEnglish ? {
    '.brand': 'Back to top', '#algorithmCategory': 'Algorithm category', '#algorithmSelect': 'MPPT algorithm', '#controlPanel': 'Algorithm parameter settings',
    '#iuChart': 'PV array, Boost converter, MPPT controller, and resistive-load system diagram', '#puChart': 'P–U curves and search points', '#convergenceChart': 'Power trajectories versus iteration', '#outputPowerChart': 'PV array output-power waveform',
    '#particleLegend': 'Candidate legend', '.output-model-note': 'Waveform legend', '.playback': 'Animation controls', '#parameterHelpButton': 'Explain current algorithm parameters', '#resetAlgorithmButton': 'Reset current algorithm parameters', '#previousButton': 'Previous iteration', '#playButton': 'Play or pause', '#nextButton': 'Next iteration', '#timeline': 'Iteration progress', '#speed': 'Playback speed',
  } : {
    '.brand': '回到顶部', '#algorithmCategory': '算法类别', '#algorithmSelect': '具体 MPPT 算法', '#controlPanel': '算法参数设置',
    '#iuChart': '四块光伏模块、Boost 变换器、MPPT 控制器与电阻负载系统架构图', '#puChart': 'P-U 曲线与搜索点', '#convergenceChart': '功率随迭代次数的变化曲线', '#outputPowerChart': '光伏阵列输出功率波形',
    '#particleLegend': '候选点图例', '.output-model-note': '波形图例', '.playback': '动画播放控制', '#parameterHelpButton': '解释当前算法参数', '#resetAlgorithmButton': '恢复当前算法默认参数', '#previousButton': '上一次迭代', '#playButton': '播放或暂停', '#nextButton': '下一次迭代', '#timeline': '迭代进度', '#speed': '播放速度',
  };
  Object.entries(aria).forEach(([selector, label]) => $(selector)?.setAttribute('aria-label', label));

  document.querySelectorAll('[data-condition-index]').forEach((span) => { span.textContent = `${tr('condition')} ${Number(span.dataset.conditionIndex) + 1}`; });
  document.querySelectorAll('.number-entry small[data-unit-key]').forEach((suffix) => { suffix.textContent = localizedUnit(suffix.dataset.unitKey, suffix.dataset.unitZh); });
  document.querySelectorAll('.parameter > .range-number-row input[type="number"]').forEach((numberInput) => {
    const label = numberInput.closest('.parameter')?.querySelector('b')?.textContent || '';
    numberInput.setAttribute('aria-label', `${label}${tr('numericInput')}`);
  });

  populateAlgorithmSelect(controls.algorithmCategory.value, state.algorithm);
  updateAlgorithmUi();
  if (state.history.length) renderParticleLegend(state.history[0].positions.length);
  if (state.data) render();
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language); } catch (_) { /* storage is optional */ }
  if (announce) showToast(isEnglish ? 'English interface enabled' : '已切换到中文界面');
}

function setupRangeNumberInputs() {
  const units = {
    particleCount: '个',
    iterations: '次',
    maxVelocity: '%',
    poStep: 'V',
    poIterations: '次',
    poMaxVelocity: '%',
    hcStep: 'V',
    hcDeadband: 'W',
    hcMaxVelocity: '%',
    hcIterations: '次',
    vpoMinStep: 'V',
    vpoMaxStep: 'V',
    vpoMaxVelocity: '%',
    vpoIterations: '次',
    jeincStep: 'V',
    jeincJumpDepth: 'V',
    jeincMaxJumps: '次',
    jeincIterations: '次',
    jeincMaxVelocity: '%',
    cvtVoc: 'V',
    cvtIterations: '次',
    cvtMaxVelocity: '%',
    focvSamplePeriod: '次',
    focvMaxVelocity: '%',
    focvIterations: '次',
    scanStep: 'V',
    scanHold: '次',
    scanMaxVelocity: '%',
    scanIterations: '次',
    escAmplitude: 'V',
    escPeriod: '次',
    escMaxVelocity: '%',
    escIterations: '次',
    saTemperature: '',
    saCooling: '',
    saStep: 'V',
    saIterations: '次',
    gaPopulation: '个',
    gaMutationSpan: '%',
    gaIterations: '次',
    csNests: '个',
    csLevyScale: '%',
    csIterations: '次',
    incStep: 'V',
    incMaxVelocity: '%',
    incIterations: '次',
    vincMinStep: 'V',
    vincMaxStep: 'V',
    vincMaxVelocity: '%',
    vincIterations: '次',
    mpcStep: 'V',
    mpcHorizon: '步',
    mpcMaxVelocity: '%',
    mpcIterations: '次',
    fuzzyStep: 'V',
    fuzzyIterations: '次',
    abcPopulation: '个',
    abcIterations: '次',
    afsaPopulation: '个',
    afsaVisual: '%',
    afsaStep: '%',
    afsaTry: '次',
    afsaIterations: '次',
    dePopulation: '个',
    deIterations: '次',
    nnHidden: '个',
    nnEpochs: '轮',
    nnMaxVelocity: '%',
    nnIterations: '次',
    svrMaxVelocity: '%',
    svrIterations: '次',
    rfTrees: '棵',
    rfDepth: '层',
    rfSampleRatio: '%',
    rfMaxVelocity: '%',
    rfIterations: '次',
    rlEpisodes: '回合',
    rlStep: 'V',
    rlIterations: '次',
    dqnReplay: '条', dqnStep: 'V', dqnIterations: '次', sacMaxAction: 'V', sacIterations: '次',
    psoPoPopulation: '个', psoPoSwitch: '%', psoPoStep: 'V', psoPoIterations: '次', gaPoPopulation: '个', gaPoStep: 'V', gaPoIterations: '次',
    gaFuzzyPopulation: '个', gaFuzzyStep: 'V', gaFuzzyIterations: '次', gaAnnPopulation: '个', gaAnnIterations: '次', abcAbandonLimit: '次',
    updateTime: 'ms',
    inductance: 'mH',
    capacitance: 'μF',
    outputCapacitance: 'μF',
    loadResistance: 'Ω',
  };
  $('#controlPanel').querySelectorAll('.parameter > input[type="range"]').forEach((range) => {
    if ($(`#${range.id}Number`)) return;
    const row = document.createElement('div');
    row.className = 'range-number-row';
    range.before(row);
    row.appendChild(range);

    const entry = document.createElement('span');
    entry.className = `number-entry${units[range.id] ? ' has-unit' : ''}`;
    const numberInput = document.createElement('input');
    numberInput.id = `${range.id}Number`;
    numberInput.type = 'number';
    numberInput.step = range.step || 'any';
    numberInput.value = range.value;
    numberInput.inputMode = 'decimal';
    numberInput.setAttribute('aria-label', `${range.closest('.parameter').querySelector('b').textContent}${tr('numericInput')}`);
    entry.appendChild(numberInput);
    if (units[range.id]) {
      const suffix = document.createElement('small');
      suffix.dataset.unitKey = range.id;
      suffix.dataset.unitZh = units[range.id];
      suffix.textContent = localizedUnit(range.id, units[range.id]);
      entry.appendChild(suffix);
    }
    row.appendChild(entry);
  });
}

function bindControls() {
  setupRangeNumberInputs();
  const valueFormats = {
    particleCount: (v) => v,
    inertia: (v) => Number(v).toFixed(2),
    cognitive: (v) => Number(v).toFixed(2),
    social: (v) => Number(v).toFixed(2),
    iterations: (v) => v,
    maxVelocity: (v) => `${v}%`,
    poStep: (v) => `${Number(v).toFixed(2)} V`,
    poIterations: (v) => v,
    poMaxVelocity: (v) => `${v}%`,
    hcStep: (v) => `${Number(v).toFixed(2)} V`,
    hcDeadband: (v) => `${Number(v).toFixed(2)} W`,
    hcMaxVelocity: (v) => `${v}%`,
    hcIterations: (v) => v,
    vpoMinStep: (v) => `${Number(v).toFixed(2)} V`,
    vpoMaxStep: (v) => `${Number(v).toFixed(2)} V`,
    vpoSlopeGain: (v) => Number(v).toFixed(2),
    vpoMaxVelocity: (v) => `${v}%`,
    vpoIterations: (v) => v,
    jeincStep: (v) => `${Number(v).toFixed(2)} V`,
    jeincJumpDepth: (v) => `${Number(v).toFixed(2)} V`,
    jeincMaxJumps: (v) => v,
    jeincIterations: (v) => v,
    jeincMaxVelocity: (v) => `${v}%`,
    cvtVoc: (v) => `${Number(v).toFixed(2)} V`,
    cvtIterations: (v) => v,
    cvtMaxVelocity: (v) => `${v}%`,
    focvRatio: (v) => Number(v).toFixed(2),
    focvSamplePeriod: (v) => v,
    focvMaxVelocity: (v) => `${v}%`,
    focvIterations: (v) => v,
    scanStep: (v) => `${Number(v).toFixed(2)} V`,
    scanHold: (v) => v,
    scanMaxVelocity: (v) => `${v}%`,
    scanIterations: (v) => v,
    escAmplitude: (v) => `${Number(v).toFixed(2)} V`,
    escGain: (v) => Number(v).toFixed(2),
    escPeriod: (v) => v,
    escMaxVelocity: (v) => `${v}%`,
    escIterations: (v) => v,
    saTemperature: (v) => Number(v).toFixed(2),
    saCooling: (v) => Number(v).toFixed(3),
    saStep: (v) => `${Number(v).toFixed(2)} V`,
    saIterations: (v) => v,
    gaPopulation: (v) => v,
    gaCrossover: (v) => Number(v).toFixed(2),
    gaMutation: (v) => Number(v).toFixed(2),
    gaMutationSpan: (v) => `${v}%`,
    gaIterations: (v) => v,
    csNests: (v) => v,
    csLevyScale: (v) => `${v}%`,
    csDiscovery: (v) => Number(v).toFixed(2),
    csIterations: (v) => v,
    incStep: (v) => `${Number(v).toFixed(2)} V`,
    incTolerance: (v) => Number(v).toFixed(3),
    incMaxVelocity: (v) => `${v}%`,
    incIterations: (v) => v,
    vincMinStep: (v) => `${Number(v).toFixed(2)} V`,
    vincMaxStep: (v) => `${Number(v).toFixed(2)} V`,
    vincCompensation: (v) => Number(v).toFixed(2),
    vincTolerance: (v) => Number(v).toFixed(3),
    vincMaxVelocity: (v) => `${v}%`,
    vincIterations: (v) => v,
    mpcStep: (v) => `${Number(v).toFixed(2)} V`,
    mpcHorizon: (v) => v,
    mpcPenalty: (v) => Number(v).toFixed(2),
    mpcMaxVelocity: (v) => `${v}%`,
    mpcIterations: (v) => v,
    fuzzyStep: (v) => `${Number(v).toFixed(2)} V`,
    fuzzyErrorGain: (v) => Number(v).toFixed(2),
    fuzzyDeltaGain: (v) => Number(v).toFixed(2),
    fuzzyIterations: (v) => v,
    abcPopulation: (v) => v,
    abcPhi: (v) => Number(v).toFixed(2),
    abcBestGain: (v) => Number(v).toFixed(2),
    abcIterations: (v) => v,
    afsaPopulation: (v) => v,
    afsaVisual: (v) => `${v}%`,
    afsaStep: (v) => `${v}%`,
    afsaCrowd: (v) => Number(v).toFixed(2),
    afsaTry: (v) => v,
    afsaIterations: (v) => v,
    dePopulation: (v) => v,
    deFactor: (v) => Number(v).toFixed(2),
    deCrossover: (v) => Number(v).toFixed(2),
    deIterations: (v) => v,
    nnHidden: (v) => v,
    nnLearningRate: (v) => Number(v).toFixed(3).replace(/0+$/, '').replace(/\.$/, ''),
    nnEpochs: (v) => v,
    nnMaxVelocity: (v) => `${v}%`,
    nnIterations: (v) => v,
    svrPenalty: (v) => Number(v).toFixed(2),
    svrEpsilon: (v) => Number(v).toFixed(3),
    svrGamma: (v) => Number(v).toFixed(2),
    svrMaxVelocity: (v) => `${v}%`,
    svrIterations: (v) => v,
    rfTrees: (v) => v,
    rfDepth: (v) => v,
    rfSampleRatio: (v) => `${v}%`,
    rfMaxVelocity: (v) => `${v}%`,
    rfIterations: (v) => v,
    rlLearningRate: (v) => Number(v).toFixed(2),
    rlDiscount: (v) => Number(v).toFixed(2),
    rlExploration: (v) => Number(v).toFixed(2),
    rlEpisodes: (v) => v,
    rlStep: (v) => `${Number(v).toFixed(2)} V`,
    rlIterations: (v) => v,
    dqnLearningRate: (v) => Number(v).toFixed(3), dqnDiscount: (v) => Number(v).toFixed(2), dqnExploration: (v) => Number(v).toFixed(2), dqnReplay: (v) => v, dqnStep: (v) => `${Number(v).toFixed(2)} V`, dqnIterations: (v) => v,
    sacActorRate: (v) => Number(v).toFixed(3), sacDiscount: (v) => Number(v).toFixed(2), sacEntropy: (v) => Number(v).toFixed(2), sacMaxAction: (v) => `${Number(v).toFixed(2)} V`, sacIterations: (v) => v,
    psoPoPopulation: (v) => v, psoPoSwitch: (v) => `${v}%`, psoPoStep: (v) => `${Number(v).toFixed(2)} V`, psoPoIterations: (v) => v,
    gaPoPopulation: (v) => v, gaPoMutation: (v) => Number(v).toFixed(2), gaPoStep: (v) => `${Number(v).toFixed(2)} V`, gaPoIterations: (v) => v,
    gaFuzzyPopulation: (v) => v, gaFuzzyStep: (v) => `${Number(v).toFixed(2)} V`, gaFuzzyGain: (v) => Number(v).toFixed(2), gaFuzzyIterations: (v) => v, abcAbandonLimit: (v) => v,
    gaAnnPopulation: (v) => v, gaAnnMutation: (v) => Number(v).toFixed(2), gaAnnGuide: (v) => Number(v).toFixed(2), gaAnnIterations: (v) => v,
    updateTime: (v) => `${Number(v).toFixed(2)} ms`,
    inductance: (v) => `${Number(v).toFixed(2)} mH`,
    capacitance: (v) => `${Number(v).toFixed(Number(v) % 1 === 0 ? 0 : 2)} μF`,
    outputCapacitance: (v) => `${Number(v).toFixed(Number(v) % 1 === 0 ? 0 : 2)} μF`,
    loadResistance: (v) => `${Number(v).toFixed(2)} Ω`,
  };
  const updateControlDisplay = (key, input, value) => {
    const output = $(`#${key}Value`);
    if (output) output.textContent = valueFormats[key] ? valueFormats[key](value) : value;
    if (key === 'iterations' || key.endsWith('Iterations')) {
      $('#timeline').max = Math.max(0, Math.round(Number(value)));
      renderMetrics();
    }
    invalidateSimulation();
  };
  const resetCurrentAlgorithmParameters = () => {
    stopPlayback();
    const panel = $(`#${state.algorithm}Parameters`);
    const iterationKey = algorithmContent[state.algorithm]?.iterationKey;
    const iterationInput = iterationKey ? controls[iterationKey] : null;
    const fields = [...new Set([
      ...(panel ? panel.querySelectorAll('input[type="range"], select') : []),
      ...(iterationInput ? [iterationInput] : []),
    ])];
    fields.forEach((field) => {
      if (field instanceof HTMLSelectElement) {
        const defaultIndex = [...field.options].findIndex((option) => option.defaultSelected);
        field.selectedIndex = defaultIndex >= 0 ? defaultIndex : 0;
        return;
      }
      field.value = field.defaultValue;
      field.classList.remove('thumb-hidden');
      const numberInput = $(`#${field.id}Number`);
      if (numberInput) numberInput.value = field.value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
    invalidateSimulation();
    showToast(`${tr('resetDefaults')}${localizedAlgorithmLabel(state.algorithm)}`);
  };
  Object.entries(controls).forEach(([key, input]) => {
    if (!input || key === 'initialDistribution' || key.endsWith('InitialDistribution') || key === 'algorithmCategory' || key === 'algorithmSelect') return;
    const numberInput = $(`#${key}Number`);
    input.addEventListener('input', () => {
      if (numberInput) numberInput.value = input.value;
      input.classList.remove('thumb-hidden');
      updateControlDisplay(key, input, input.value);
    });
    numberInput?.addEventListener('input', () => {
      if (numberInput.value.trim() === '') return;
      const value = Number(numberInput.value);
      if (!Number.isFinite(value)) return;
      const min = Number(input.min);
      const max = Number(input.max);
      if (value >= min && value <= max) {
        input.value = String(value);
        input.classList.remove('thumb-hidden');
      } else {
        input.classList.add('thumb-hidden');
      }
      updateControlDisplay(key, input, value);
    });
  });
  controls.algorithmCategory.addEventListener('change', () => {
    stopPlayback();
    populateAlgorithmSelect(controls.algorithmCategory.value);
    updateAlgorithmUi();
    invalidateSimulation();
    showToast(`${tr('switchedTo')}${controls.algorithmCategory.options[controls.algorithmCategory.selectedIndex].text}`);
  });
  controls.algorithmSelect.addEventListener('change', () => {
    stopPlayback();
    state.algorithm = controls.algorithmSelect.value;
    updateAlgorithmUi();
    invalidateSimulation();
    showToast(`${tr('switchedTo')}${controls.algorithmSelect.options[controls.algorithmSelect.selectedIndex].text}`);
  });
  [
    controls.initialDistribution,
    controls.gaInitialDistribution,
    controls.csInitialDistribution,
    controls.abcInitialDistribution,
    controls.afsaInitialDistribution,
    controls.deInitialDistribution,
    controls.psoPoInitialDistribution,
    controls.gaPoInitialDistribution,
    controls.gaFuzzyInitialDistribution,
    controls.gaAnnInitialDistribution,
  ].forEach((select) => select.addEventListener('change', invalidateSimulation));
  $('#runButton').addEventListener('click', toggleRunButton);
  $('#playButton').addEventListener('click', toggleProgressPlayback);
  $('#previousButton').addEventListener('click', () => { if (!state.history.length) return; stopPlayback(); state.currentIteration = Math.max(0, state.currentIteration - 1); render(); });
  $('#nextButton').addEventListener('click', () => { if (!state.history.length) return; stopPlayback(); state.currentIteration = Math.min(state.history.length - 1, state.currentIteration + 1); render(); });
  $('#timeline').addEventListener('input', (event) => { if (!state.history.length) return; stopPlayback(); state.currentIteration = Math.min(state.history.length - 1, Number(event.target.value)); render(); });
  $('#speed').addEventListener('change', () => { if (state.playing) { stopPlayback(); startPlayback(); } });
  $('#downloadButton').addEventListener('click', downloadCsv);
  $('#parameterHelpButton').addEventListener('click', openParameterHelp);
  $('#parameterHelpClose').addEventListener('click', closeParameterHelp);
  $('#parameterHelpModal').addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeParameterHelp();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#parameterHelpModal').hidden) closeParameterHelp();
  });
  $('#resetAlgorithmButton').addEventListener('click', resetCurrentAlgorithmParameters);
  $('#languageToggle').addEventListener('click', () => {
    state.language = state.language === 'zh' ? 'en' : 'zh';
    applyLanguage(true);
  });
  window.addEventListener('resize', queueCanvasRender);
  window.addEventListener('pageshow', queueCanvasRender);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) queueCanvasRender(); });
}

async function initialize() {
  captureStaticTranslations();
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage === 'zh' || savedLanguage === 'en') state.language = savedLanguage;
  } catch (_) { /* storage is optional */ }
  applyStaticTranslations();
  try {
    const response = await fetch('./data/curves.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    const options = $('#conditionOptions');
    state.data.conditions.forEach((condition, index) => {
      const label = document.createElement('label');
      label.className = 'condition-option';
      label.innerHTML = `<input type="radio" name="condition" value="${index}" ${index === 0 ? 'checked' : ''}><span data-condition-index="${index}">${tr('condition')} ${index + 1}</span>`;
      label.querySelector('input').addEventListener('change', () => {
        stopPlayback(); state.conditionIndex = index; invalidateSimulation(); showToast(`${tr('switchedTo')}${tr('condition')} ${index + 1}`);
      });
      options.appendChild(label);
    });
    populateAlgorithmSelect(controls.algorithmCategory.value, state.algorithm);
    bindControls();
    applyLanguage(false);
    invalidateSimulation();
    installCanvasResizeObserver();
    queueCanvasRender();
    document.fonts?.ready.then(queueCanvasRender);
  } catch (error) {
    console.error(error);
    $('#runButton').disabled = true;
    showToast(tr('loadFailed'));
  }
}

initialize();

