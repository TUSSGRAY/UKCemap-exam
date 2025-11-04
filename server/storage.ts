import type { Question, InsertQuestion, QuizMode, Advert } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllQuestions(): Promise<Question[]>;
  getQuestionsByMode(mode: QuizMode, count: number): Promise<Question[]>;
  getRandomAdvert(): Promise<Advert>;
  recordExamPurchase(paymentIntentId: string): Promise<string>;
  recordScenarioPurchase(paymentIntentId: string): Promise<string>;
  recordBundlePurchase(paymentIntentId: string): Promise<string>;
  checkExamAccess(accessToken: string): Promise<boolean>;
  checkScenarioAccess(accessToken: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private questions: Map<string, Question>;
  private adverts: Advert[];
  private examAccessTokens: Map<string, string>;
  private scenarioAccessTokens: Map<string, string>;
  private bundleAccessTokens: Map<string, string>;

  constructor() {
    this.questions = new Map();
    this.examAccessTokens = new Map();
    this.scenarioAccessTokens = new Map();
    this.bundleAccessTokens = new Map();
    this.adverts = [
      {
        id: "1",
        message: "Get 20% off your CeMAP revision materials at StudySmart UK!",
      },
      {
        id: "2",
        message: "Ready to boost your mortgage career? Join CeMAP Masterclass Online today!",
      },
      {
        id: "3",
        message: "Refresh your knowledge with CeMAP Pro's 2025 syllabus updates!",
      },
    ];
    this.initializeQuestions();
  }

  private initializeQuestions() {
    const questionBank: Omit<Question, "id">[] = [
      // Financial Services Industry & Intermediation (15 questions)
      {
        topic: "Financial Services Industry",
        question: "The acronym GRAM represents the four main elements of intermediation. What does the 'M' stand for?",
        optionA: "Monetary Transformation",
        optionB: "Maturity Transformation",
        optionC: "Market Transformation",
        optionD: "Medium Transformation",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "According to the textbook, what are the four properties of money remembered by the acronym PADS?",
        optionA: "Portable, Acceptable, Divisible, Stable",
        optionB: "Portable, Acceptable, Divisible, Sufficient in quantity",
        optionC: "Protected, Accessible, Divisible, Secure",
        optionD: "Portable, Accountable, Distributed, Sufficient",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "How many times per year does the Monetary Policy Committee (MPC) meet to set the base rate?",
        optionA: "6 times per year",
        optionB: "8 times per year (every 6 weeks)",
        optionC: "12 times per year (monthly)",
        optionD: "4 times per year (quarterly)",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "Which of the following best describes 'disintermediation'?",
        optionA: "When intermediaries reduce their profit margins",
        optionB: "When surplus and deficit sectors find each other directly, cutting out the intermediary",
        optionC: "When banks merge with building societies",
        optionD: "When financial institutions expand their services",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "What is the minimum reserve requirement for Credit Unions?",
        optionA: "£25,000 or 3% of assets, whichever is higher",
        optionB: "£50,000 or 5% of assets, whichever is higher",
        optionC: "£75,000 or 7% of assets, whichever is higher",
        optionD: "£100,000 or 10% of assets, whichever is higher",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "What typical interest rate range do Credit Unions charge on loans to members?",
        optionA: "0.5% - 1.5% of the reducing balance",
        optionB: "1% - 3% of the reducing balance",
        optionC: "2% - 5% of the reducing balance",
        optionD: "5% - 10% of the reducing balance",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "Which Act restricts funding for mutual organizations that have not converted to proprietary status?",
        optionA: "Financial Services Act 1986",
        optionB: "Building Societies Act 1986",
        optionC: "Banking Act 1987",
        optionD: "Mutual Organizations Act 1985",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "What is the primary function of the Debt Management Office (DMO)?",
        optionA: "To regulate consumer debt",
        optionB: "To issue government debt in the form of gilts",
        optionC: "To manage corporate debt restructuring",
        optionD: "To oversee mortgage lending",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "What is meant by 'ring-fencing' in financial services?",
        optionA: "Limiting executive bonuses",
        optionB: "Separating retail and wholesale banking activities to protect retail consumers",
        optionC: "Restricting foreign investment",
        optionD: "Protecting intellectual property",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "In a mutual organization, how much must a member pay for a share to gain equal voting rights?",
        optionA: "£1",
        optionB: "£5",
        optionC: "£10",
        optionD: "£100",
        answer: "A"
      },
      {
        topic: "Financial Services Industry",
        question: "Which term describes the Bank of England's role to provide emergency funding to banks facing liquidity problems?",
        optionA: "Primary lender",
        optionB: "Lender of last resort",
        optionC: "Emergency banker",
        optionD: "Crisis facilitator",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "When was the Bank of England originally founded?",
        optionA: "1664",
        optionB: "1694",
        optionC: "1714",
        optionD: "1744",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "Which committee at the Bank of England helps maintain economic stability?",
        optionA: "Financial Policy Committee (FPC)",
        optionB: "Financial Stability Committee (FSC)",
        optionC: "Economic Policy Committee (EPC)",
        optionD: "Stability and Growth Committee (SGC)",
        answer: "A"
      },
      {
        topic: "Financial Services Industry",
        question: "What process describes putting together lots of small deposits to match a larger loan?",
        optionA: "Consolidation",
        optionB: "Aggregation",
        optionC: "Accumulation",
        optionD: "Assembly",
        answer: "B"
      },
      {
        topic: "Financial Services Industry",
        question: "Which element of GRAM addresses the challenge of lenders and borrowers needing to find each other?",
        optionA: "Geographic Transformation",
        optionB: "Geographical Distribution",
        optionC: "Global Reach",
        optionD: "General Access",
        answer: "A"
      },

      // Economic Policy & Regulation (15 questions)
      {
        topic: "Economic Policy",
        question: "What is the UK government's inflation target as measured by the Consumer Prices Index (CPI)?",
        optionA: "1%",
        optionB: "2%",
        optionC: "2.5%",
        optionD: "3%",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "What CPI range is considered acceptable by the government?",
        optionA: "0.5% - 2.5%",
        optionB: "1% - 3%",
        optionC: "1.5% - 3.5%",
        optionD: "2% - 4%",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "How many consecutive quarters of negative economic growth define a recession?",
        optionA: "1 quarter",
        optionB: "2 quarters",
        optionC: "3 quarters",
        optionD: "4 quarters",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "Which EU legislative instrument is binding in its entirety, prescribing both what and how to achieve it?",
        optionA: "Directive",
        optionB: "Regulation",
        optionC: "Dispensation",
        optionD: "Resolution",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "Which EU legislative instrument is binding only as to the result, allowing member states flexibility in how to achieve it?",
        optionA: "Regulation",
        optionB: "Directive",
        optionC: "Recommendation",
        optionD: "Decision",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "What is the typical timescale for implementation of an EU Directive?",
        optionA: "1 year",
        optionB: "2 years",
        optionC: "3 years",
        optionD: "5 years",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "From approximately what interest rate did the Bank of England base rate fall to 0.5% during the credit crunch period mentioned in the textbook?",
        optionA: "Over 3%",
        optionB: "Over 5%",
        optionC: "Over 7%",
        optionD: "Over 10%",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "Between which years were interest rates kept below 1% to stimulate economic growth?",
        optionA: "2007 and 2019",
        optionB: "2009 and 2021",
        optionC: "2010 and 2022",
        optionD: "2008 and 2020",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "What is the name given to a budget where government spending equals tax revenues?",
        optionA: "Surplus budget",
        optionB: "Balanced budget",
        optionC: "Neutral budget",
        optionD: "Equilibrium budget",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "Which budget outcome has an expansionary effect on the economy?",
        optionA: "Budget surplus",
        optionB: "Budget deficit",
        optionC: "Balanced budget",
        optionD: "Neutral budget",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "What does GDP stand for?",
        optionA: "General Domestic Production",
        optionB: "Gross Domestic Product",
        optionC: "Gross Development Product",
        optionD: "General Development Productivity",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "How frequently is GDP measured?",
        optionA: "Monthly",
        optionB: "Quarterly",
        optionC: "Bi-annually",
        optionD: "Annually",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "Which European Authority is responsible for banking supervision?",
        optionA: "European Central Authority",
        optionB: "European Banking Authority",
        optionC: "European Financial Authority",
        optionD: "European Supervision Authority",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "What does SSM stand for in European banking supervision?",
        optionA: "Systemic Supervision Mechanism",
        optionB: "Single Supervisory Mechanism",
        optionC: "Standardized Supervisory Model",
        optionD: "Secure Supervision Method",
        answer: "B"
      },
      {
        topic: "Economic Policy",
        question: "According to monetarist economics, what causes inflation?",
        optionA: "Decrease in money supply",
        optionB: "Increase in money supply from lending and borrowing",
        optionC: "Government spending cuts",
        optionD: "Reduced consumer confidence",
        answer: "B"
      },

      // UK Taxation - Income Tax (18 questions)
      {
        topic: "UK Taxation",
        question: "What is the current personal allowance before income tax is payable?",
        optionA: "£11,850",
        optionB: "£12,570",
        optionC: "£13,850",
        optionD: "£12,500",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "At what income level does the personal allowance begin to taper?",
        optionA: "£50,000",
        optionB: "£100,000",
        optionC: "£125,000",
        optionD: "£150,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "How much does the personal allowance reduce for every £2 earned above £100,000?",
        optionA: "£0.50",
        optionB: "£1",
        optionC: "£1.50",
        optionD: "£2",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "At what income level does the personal allowance disappear entirely?",
        optionA: "£120,140",
        optionB: "£125,140",
        optionC: "£127,000",
        optionD: "£130,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What are the dates of the UK fiscal tax year?",
        optionA: "1st January - 31st December",
        optionB: "6th April - 5th April",
        optionC: "1st April - 31st March",
        optionD: "1st May - 30th April",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Starting Rate for Savings on the first portion of savings interest?",
        optionA: "0% on first £3,000",
        optionB: "0% on first £5,000",
        optionC: "0% on first £7,500",
        optionD: "0% on first £10,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Between what income levels does the starting rate for savings potentially apply?",
        optionA: "£10,570 and £15,570",
        optionB: "£12,570 and £17,570",
        optionC: "£11,570 and £16,570",
        optionD: "£13,570 and £18,570",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Personal Savings Allowance (PSA) for basic rate taxpayers?",
        optionA: "£500",
        optionB: "£1,000",
        optionC: "£1,500",
        optionD: "£2,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Personal Savings Allowance (PSA) for higher rate taxpayers?",
        optionA: "£250",
        optionB: "£500",
        optionC: "£750",
        optionD: "£1,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the dividend allowance amount?",
        optionA: "£250",
        optionB: "£500",
        optionC: "£750",
        optionD: "£1,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the property and trading income allowance?",
        optionA: "£500",
        optionB: "£1,000",
        optionC: "£1,500",
        optionD: "£2,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "For self-employed individuals, on which two dates is income tax typically paid?",
        optionA: "January 1st and July 1st",
        optionB: "January 31st and July 31st",
        optionC: "April 6th and October 6th",
        optionD: "March 31st and September 30th",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Business expenses for employed people must be:",
        optionA: "Wholly and exclusively for the trade",
        optionB: "Wholly, exclusively, and necessarily for the job",
        optionC: "Reasonably and necessarily for the job",
        optionD: "Wholly or partially for the job",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Business expenses for self-employed people must be:",
        optionA: "Wholly, exclusively, and necessarily for the trade",
        optionB: "Wholly and exclusively for the trade",
        optionC: "Reasonably and exclusively for the trade",
        optionD: "Wholly or partially for the trade",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "How many days must an individual spend in the UK during a tax year to be classed as UK resident for tax purposes?",
        optionA: "120 days or more",
        optionB: "183 days or more",
        optionC: "200 days or more",
        optionD: "270 days or more",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "After how many years out of the last 20 is someone considered 'deemed domiciled' in the UK?",
        optionA: "10 years",
        optionB: "15 years",
        optionC: "17 years",
        optionD: "20 years",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Which form confirms total tax deducted, National Insurance Contributions and final tax codes for the last tax year, issued in May?",
        optionA: "P45",
        optionB: "P60",
        optionC: "P11D",
        optionD: "P85",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Which National Insurance class is specifically for voluntary contributions?",
        optionA: "Class 1",
        optionB: "Class 3",
        optionC: "Class 2",
        optionD: "Class 4",
        answer: "B"
      },

      // UK Taxation - CGT & IHT (20 questions)
      {
        topic: "UK Taxation",
        question: "Within how many days must Capital Gains Tax be paid on non-exempt residential property sales?",
        optionA: "30 days",
        optionB: "60 days",
        optionC: "90 days",
        optionD: "120 days",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "For CGT purposes, what is used as the acquisition cost for assets acquired before 31st March 1982?",
        optionA: "Original purchase price",
        optionB: "Value on 31st March 1982",
        optionC: "Current market value",
        optionD: "Estimated historical value",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the 'bed and breakfasting' rule period for shares?",
        optionA: "14 days",
        optionB: "30 days",
        optionC: "60 days",
        optionD: "90 days",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Within how many years must business assets be replaced to qualify for roll over relief?",
        optionA: "1 year",
        optionB: "3 years",
        optionC: "5 years",
        optionD: "7 years",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "If someone dies between 4-5 years after making a gift, what is the taper relief available?",
        optionA: "20%",
        optionB: "40%",
        optionC: "60%",
        optionD: "80%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "If someone dies between 5-6 years after making a gift, what is the IHT rate after taper relief?",
        optionA: "16%",
        optionB: "24%",
        optionC: "32%",
        optionD: "40%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "If someone dies between 6-7 years after making a gift, what taper relief is available?",
        optionA: "40%",
        optionB: "60%",
        optionC: "80%",
        optionD: "100%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the immediate charge rate for Chargeable Lifetime Transfers (CLT) to trusts exceeding the nil rate band?",
        optionA: "10%",
        optionB: "20%",
        optionC: "30%",
        optionD: "40%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the current annual gift allowance for IHT purposes?",
        optionA: "£2,000",
        optionB: "£3,000",
        optionC: "£5,000",
        optionD: "£10,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "By how many years can the annual gift allowance be carried forward?",
        optionA: "Not carried forward",
        optionB: "1 year",
        optionC: "2 years",
        optionD: "3 years",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the small gift allowance per person for IHT?",
        optionA: "£100",
        optionB: "£250",
        optionC: "£500",
        optionD: "£1,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the maximum IHT-free gift a parent can give to a child for their wedding/civil partnership?",
        optionA: "£2,500",
        optionB: "£5,000",
        optionC: "£10,000",
        optionD: "£7,500",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the maximum IHT-free gift to a grandchild for their wedding/civil partnership?",
        optionA: "£1,000",
        optionB: "£2,500",
        optionC: "£5,000",
        optionD: "£3,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the maximum IHT-free wedding gift to others (not children or grandchildren)?",
        optionA: "£500",
        optionB: "£1,000",
        optionC: "£1,500",
        optionD: "£2,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "With a jointly owned property where the RNRB is £175,000, what is the maximum transferable RNRB to a surviving spouse?",
        optionA: "£175,000",
        optionB: "£350,000",
        optionC: "£500,000",
        optionD: "£325,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Assuming full NRB transfer, what total NRB can a surviving spouse have?",
        optionA: "£325,000",
        optionB: "£650,000",
        optionC: "£500,000",
        optionD: "£975,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Up to what total value can a family home be left to direct descendants free of IHT (with full NRB and RNRB transfer)?",
        optionA: "£650,000",
        optionB: "£1,000,000",
        optionC: "£850,000",
        optionD: "£1,300,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "If someone dies 1-3 years after making a gift, what is the IHT rate due?",
        optionA: "32%",
        optionB: "40%",
        optionC: "24%",
        optionD: "16%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "If someone dies between 4-5 years after making a gift, what is the IHT rate after taper relief?",
        optionA: "24%",
        optionB: "32%",
        optionC: "16%",
        optionD: "40%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Which type of trust qualifies for the full annual CGT exemption?",
        optionA: "Discretionary trust",
        optionB: "Bare trust",
        optionC: "Interest in possession trust",
        optionD: "Accumulation trust",
        answer: "B"
      },

      // UK Taxation - Stamp Duty & VAT (12 questions)
      {
        topic: "UK Taxation",
        question: "What is the Stamp Duty Reserve Tax rate on the paperless purchase of shares over £1,000?",
        optionA: "0.25%",
        optionB: "0.5%",
        optionC: "1%",
        optionD: "1.5%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Stamp Duty rate on bearer instruments?",
        optionA: "0.5%",
        optionB: "1.5%",
        optionC: "2%",
        optionD: "3%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Stamp Duty Land Tax rate on property value between £250,000 and £925,000?",
        optionA: "2%",
        optionB: "5%",
        optionC: "10%",
        optionD: "12%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Stamp Duty Land Tax rate on property value between £925,000 and £1.5M?",
        optionA: "5%",
        optionB: "10%",
        optionC: "12%",
        optionD: "15%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the Stamp Duty Land Tax rate on property value above £1.5M?",
        optionA: "10%",
        optionB: "12%",
        optionC: "15%",
        optionD: "17%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What percentage is added to SDLT rates when purchasing an additional residential property?",
        optionA: "2%",
        optionB: "3%",
        optionC: "4%",
        optionD: "5%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Up to what property value do first-time buyers pay no SDLT?",
        optionA: "£300,000",
        optionB: "£425,000",
        optionC: "£500,000",
        optionD: "£625,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "For first-time buyers purchasing between £425,000 and what amount is there a 5% charge on the excess?",
        optionA: "£500,000",
        optionB: "£625,000",
        optionC: "£750,000",
        optionD: "£925,000",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Companies with profits over what amount can pay corporation tax in quarterly installments?",
        optionA: "£1m",
        optionB: "£1.5m",
        optionC: "£2m",
        optionD: "£5m",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Within how many months of their business tax year ending do companies with profits up to £1.5m pay corporation tax?",
        optionA: "6 months",
        optionB: "9 months",
        optionC: "12 months",
        optionD: "18 months",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "What is the withholding tax rate for non-UK resident entertainers and performers?",
        optionA: "10%",
        optionB: "20%",
        optionC: "25%",
        optionD: "30%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        question: "Which of the following is zero-rated for VAT purposes?",
        optionA: "Adult clothes",
        optionB: "Children's clothes",
        optionC: "Designer clothes",
        optionD: "Work uniforms",
        answer: "B"
      },

      // Welfare State Benefits (12 questions)
      {
        topic: "Welfare State Benefits",
        question: "How many qualifying years of NIC were required for the basic state pension?",
        optionA: "25 years",
        optionB: "30 years",
        optionC: "35 years",
        optionD: "40 years",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "For the new single tier state pension, how many years of NICs are required for the maximum benefit?",
        optionA: "30 years",
        optionB: "35 years",
        optionC: "40 years",
        optionD: "45 years",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "What is the minimum number of years of NICs required to receive any new state pension?",
        optionA: "5 years",
        optionB: "10 years",
        optionC: "15 years",
        optionD: "20 years",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "From what year will the state pension age increase to 67?",
        optionA: "2025",
        optionB: "2028",
        optionC: "2030",
        optionD: "2035",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "The triple lock ensures pensioners receive an increase in line with the higher of CPI, Average Weekly Earnings Index, or what percentage?",
        optionA: "1.5%",
        optionB: "2.5%",
        optionC: "3%",
        optionD: "3.5%",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "For how many weeks is Statutory Sick Pay paid?",
        optionA: "26 weeks",
        optionB: "28 weeks",
        optionC: "30 weeks",
        optionD: "52 weeks",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "Statutory Maternity Pay is paid at 90% of average weekly earnings for weeks 1-6. What happens in weeks 7-39?",
        optionA: "Continues at 90%",
        optionB: "Flat rate or 90% average weekly earnings, whichever is lower",
        optionC: "Flat rate only",
        optionD: "No payment",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "For how many weeks is Statutory Maternity Pay payable?",
        optionA: "26 weeks",
        optionB: "39 weeks",
        optionC: "52 weeks",
        optionD: "30 weeks",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "For how long must a woman have been with her employer to qualify for Statutory Maternity Pay?",
        optionA: "13 weeks",
        optionB: "26 weeks",
        optionC: "39 weeks",
        optionD: "52 weeks",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "Between what income levels is Child Benefit means tested via income tax?",
        optionA: "£40,000 - £50,000",
        optionB: "£50,000 - £60,000",
        optionC: "£60,000 - £70,000",
        optionD: "£70,000 - £80,000",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "What is the maximum value of mortgage that Support for Mortgage Interest can help with?",
        optionA: "£100,000",
        optionB: "£200,000",
        optionC: "£300,000",
        optionD: "£500,000",
        answer: "B"
      },
      {
        topic: "Welfare State Benefits",
        question: "For how many months is the contribution-based Job Seekers Allowance payable?",
        optionA: "3 months",
        optionB: "6 months",
        optionC: "9 months",
        optionD: "12 months",
        answer: "B"
      },

      // Mortgage Products & Features (15 questions)
      {
        topic: "Mortgage Products",
        question: "Which mortgage type has an interest rate that tracks a specified rate, typically a set percentage above the Bank of England base rate?",
        optionA: "Fixed-rate mortgage",
        optionB: "Tracker mortgage",
        optionC: "Discount mortgage",
        optionD: "Capped mortgage",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "Which mortgage product provides a discount off the lender's Standard Variable Rate for a set period?",
        optionA: "Tracker mortgage",
        optionB: "Discount mortgage",
        optionC: "Fixed-rate mortgage",
        optionD: "Offset mortgage",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is the key feature of an offset mortgage?",
        optionA: "Fixed interest rate throughout the term",
        optionB: "Savings balance reduces the mortgage balance for interest calculation purposes",
        optionC: "Interest rate capped at a maximum level",
        optionD: "Monthly payments include both capital and interest",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "In a repayment mortgage, what do the monthly payments cover?",
        optionA: "Interest only",
        optionB: "Both capital and interest",
        optionC: "Capital only",
        optionD: "Neither capital nor interest",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "In an interest-only mortgage, when is the capital repaid?",
        optionA: "Monthly throughout the term",
        optionB: "At the end of the mortgage term",
        optionC: "Quarterly in installments",
        optionD: "Annually in installments",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "Which type of mortgage allows borrowers to make overpayments, underpayments, and take payment holidays?",
        optionA: "Standard mortgage",
        optionB: "Flexible mortgage",
        optionC: "Fixed-rate mortgage",
        optionD: "Tracker mortgage",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a capped rate mortgage?",
        optionA: "Interest rate fixed for the entire term",
        optionB: "Variable rate with a maximum (cap) that cannot be exceeded",
        optionC: "Interest rate that only decreases",
        optionD: "Minimum interest rate guaranteed",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is the Standard Variable Rate (SVR)?",
        optionA: "The Bank of England base rate",
        optionB: "The lender's own variable interest rate",
        optionC: "A government-set rate",
        optionD: "A fixed rate for new customers",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "A cashback mortgage provides:",
        optionA: "Monthly cash payments during the mortgage term",
        optionB: "A lump sum payment at the start of the mortgage",
        optionC: "Cash back when you sell the property",
        optionD: "Lower interest rates for cash payments",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a buy-to-let mortgage specifically designed for?",
        optionA: "First-time buyers only",
        optionB: "Properties purchased to rent to tenants",
        optionC: "Second homes for personal use",
        optionD: "Commercial property only",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "In shared ownership, the buyer:",
        optionA: "Owns 100% with shared mortgage payments",
        optionB: "Buys a share of the property and pays rent on the remainder",
        optionC: "Rents the entire property",
        optionD: "Leases with option to buy later",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a remortgage?",
        optionA: "Taking out a second mortgage on the same property",
        optionB: "Switching to a new mortgage deal, often with a different lender",
        optionC: "Extending the original mortgage term",
        optionD: "Transferring a mortgage to a new property",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a product transfer?",
        optionA: "Transferring mortgage to a new property",
        optionB: "Moving to a new mortgage deal with your existing lender",
        optionC: "Selling your property and buying a new one",
        optionD: "Transferring ownership to another person",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is negative equity?",
        optionA: "Having no equity in the property",
        optionB: "When the outstanding mortgage exceeds the property value",
        optionC: "When monthly payments exceed income",
        optionD: "When interest rates are negative",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What does LTV (Loan to Value) represent?",
        optionA: "Total loan amount",
        optionB: "Loan amount as a percentage of property value",
        optionC: "Lender's total valuation",
        optionD: "Legal title value",
        answer: "B"
      },

      // Protection & Insurance (8 questions)
      {
        topic: "Protection Products",
        question: "Critical illness cover pays out:",
        optionA: "Monthly income for life",
        optionB: "A lump sum upon diagnosis of a specified critical illness",
        optionC: "Only upon death",
        optionD: "Medical treatment costs",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Decreasing term assurance is typically used to cover:",
        optionA: "Interest-only mortgages",
        optionB: "Repayment mortgages where the capital owed decreases",
        optionC: "Inheritance tax liability",
        optionD: "Income protection needs",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Level term assurance provides:",
        optionA: "Cover that decreases over the term",
        optionB: "A fixed sum assured throughout the policy term",
        optionC: "Cover that increases with inflation",
        optionD: "Monthly income payments",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Income protection insurance provides:",
        optionA: "A lump sum on death",
        optionB: "Regular income payments if unable to work due to illness or injury",
        optionC: "Refund of mortgage payments",
        optionD: "Medical treatment costs",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Family Income Benefit provides:",
        optionA: "A lump sum payment on death",
        optionB: "Regular income payments to beneficiaries following the policyholder's death",
        optionC: "Monthly income while alive",
        optionD: "Tax-free savings",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Buildings insurance is compulsory for mortgage borrowers because:",
        optionA: "It's required by law",
        optionB: "Lenders require it to protect their security (the property)",
        optionC: "It's cheaper when bought with a mortgage",
        optionD: "It covers the mortgage payments",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What does Mortgage Payment Protection Insurance (MPPI) typically cover?",
        optionA: "Property damage only",
        optionB: "Mortgage payments during unemployment, accident or sickness",
        optionC: "Life insurance only",
        optionD: "Interest rate increases",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Contents insurance covers:",
        optionA: "The building structure",
        optionB: "Possessions and belongings inside the property",
        optionC: "Only jewelry and valuables",
        optionD: "Mortgage payments",
        answer: "B"
      },

      // Legal Aspects & Property Law (10 questions)
      {
        topic: "Mortgage Law",
        question: "What is a 'charge' in mortgage terminology?",
        optionA: "An application fee",
        optionB: "The lender's legal right (security) over the property",
        optionC: "Monthly interest payment",
        optionD: "Property valuation cost",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "Which type of property ownership allows owners to leave their share in a will?",
        optionA: "Joint tenancy",
        optionB: "Tenants in common",
        optionC: "Sole ownership",
        optionD: "Leasehold",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "The difference between freehold and leasehold is:",
        optionA: "Price only",
        optionB: "Freehold is permanent ownership, leasehold is temporary for a fixed term",
        optionC: "Location (urban vs rural)",
        optionD: "Property type only",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is equity in property terms?",
        optionA: "The mortgage amount",
        optionB: "The difference between property value and outstanding mortgage",
        optionC: "The purchase price",
        optionD: "The deposit amount",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is the legal process of transferring property ownership called?",
        optionA: "Valuation",
        optionB: "Conveyancing",
        optionC: "Surveying",
        optionD: "Registration",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "A second charge mortgage is:",
        optionA: "A fee for a second valuation",
        optionB: "An additional loan secured against the same property, ranking after the first charge",
        optionC: "A second property purchase",
        optionD: "A remortgage",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "An Early Repayment Charge (ERC) is:",
        optionA: "A reward for early repayment",
        optionB: "A penalty charged for repaying the mortgage early during a fixed period",
        optionC: "The first monthly payment",
        optionD: "An upfront fee",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What does HMO stand for?",
        optionA: "High Mortgage Offer",
        optionB: "House in Multiple Occupation",
        optionC: "Home Management Organization",
        optionD: "Housing Market Office",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "The Land Registry is:",
        optionA: "A private property company",
        optionB: "A government body that records land and property ownership in England and Wales",
        optionC: "A mortgage lender",
        optionD: "An estate agency",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "Repossession occurs when:",
        optionA: "The property is sold willingly",
        optionB: "The lender takes back the property due to mortgage arrears/non-payment",
        optionC: "The property is renovated",
        optionD: "The mortgage term ends",
        answer: "B"
      },

      // Financial Advice Process & Regulation (10 questions)
      {
        topic: "Financial Advice Process",
        question: "A Key Facts Illustration (KFI) must be provided:",
        optionA: "After the mortgage completes",
        optionB: "Before a mortgage application is submitted",
        optionC: "Only if the customer requests it",
        optionD: "Within 7 days of completion",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "An Agreement in Principle (AIP) or Decision in Principle (DIP) indicates:",
        optionA: "Guaranteed mortgage approval",
        optionB: "Conditional indication that a lender would lend, subject to full application and checks",
        optionC: "The property has been valued",
        optionD: "The sale is legally binding",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "The purpose of a fact-find is to:",
        optionA: "Check the customer's credit score",
        optionB: "Gather comprehensive information about the customer's circumstances, needs and objectives",
        optionC: "Value the property",
        optionD: "Calculate the mortgage payment",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "A suitability report must:",
        optionA: "List every product on the market",
        optionB: "Explain why the recommended product is suitable for the customer's specific circumstances",
        optionC: "Guarantee the lowest rate",
        optionD: "Be provided after completion",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "Affordability assessment evaluates:",
        optionA: "Property value only",
        optionB: "Whether the customer can afford mortgage payments now and if circumstances change",
        optionC: "The customer's age",
        optionD: "The property location",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "A vulnerable customer is someone:",
        optionA: "Who has bad credit",
        optionB: "Whose circumstances make them especially susceptible to harm or detriment",
        optionC: "Who is a first-time buyer",
        optionD: "Who earns below average income",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "The adviser disclosure document explains:",
        optionA: "Property prices in the area",
        optionB: "The services offered by the adviser and how they are remunerated",
        optionC: "The customer's credit history",
        optionD: "Lender criteria in detail",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "A credit check is performed to:",
        optionA: "Set the property value",
        optionB: "Assess the applicant's creditworthiness and repayment history",
        optionC: "Determine the property location",
        optionD: "Calculate insurance premiums",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "FCA regulation requires firms to:",
        optionA: "Offer the cheapest product",
        optionB: "Act with integrity and treat customers fairly throughout the product lifecycle",
        optionC: "Approve every application",
        optionD: "Provide mortgages to everyone",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "Under FSMA 2000, providing mortgage advice without FCA authorization can result in:",
        optionA: "A warning only",
        optionB: "Criminal prosecution and unlimited fines",
        optionC: "A small fixed penalty",
        optionD: "Mandatory retraining",
        answer: "B"
      },

      // SCENARIO-BASED QUESTIONS (12 scenarios with 3 questions each)
      
      // Scenario 1: First-Time Buyer with Gifted Deposit
      {
        topic: "Mortgage Products",
        scenario: "Sarah and James are first-time buyers looking to purchase a property for £280,000. They have saved £14,000, and Sarah's parents are gifting them £14,000 towards the deposit. Sarah earns £32,000 per year as a teacher, and James earns £28,000 as a graphic designer. They have no other debts. Sarah's parents own their home outright and have confirmed the gift is non-repayable.",
        scenarioId: "scenario-1",
        question: "What is the Loan-to-Value (LTV) ratio for Sarah and James's mortgage?",
        optionA: "85% LTV",
        optionB: "90% LTV",
        optionC: "95% LTV",
        optionD: "80% LTV",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        scenario: "Sarah and James are first-time buyers looking to purchase a property for £280,000. They have saved £14,000, and Sarah's parents are gifting them £14,000 towards the deposit. Sarah earns £32,000 per year as a teacher, and James earns £28,000 as a graphic designer. They have no other debts. Sarah's parents own their home outright and have confirmed the gift is non-repayable.",
        scenarioId: "scenario-1",
        question: "What documentation will the lender typically require regarding the gifted deposit from Sarah's parents?",
        optionA: "Proof of funds and a gifted deposit letter confirming it's non-repayable",
        optionB: "Only a bank statement from the parents",
        optionC: "A solicitor's letter only",
        optionD: "No documentation is required for parental gifts",
        answer: "A"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Sarah and James are first-time buyers looking to purchase a property for £280,000. They have saved £14,000, and Sarah's parents are gifting them £14,000 towards the deposit. Sarah earns £32,000 per year as a teacher, and James earns £28,000 as a graphic designer. They have no other debts. Sarah's parents own their home outright and have confirmed the gift is non-repayable.",
        scenarioId: "scenario-1",
        question: "Using a typical affordability multiple of 4.5 times joint income, what is the maximum mortgage amount Sarah and James could borrow?",
        optionA: "£252,000",
        optionB: "£270,000",
        optionC: "£288,000",
        optionD: "£300,000",
        answer: "B"
      },

      // Scenario 2: Remortgage with Debt Consolidation
      {
        topic: "Mortgage Products",
        scenario: "Michael owns a property valued at £350,000 with an existing mortgage balance of £180,000. He has £25,000 in unsecured debts (credit cards and a personal loan) with monthly payments totaling £650. His current mortgage payment is £850 per month. Michael earns £55,000 per year and wants to remortgage to consolidate his debts.",
        scenarioId: "scenario-2",
        question: "If Michael remortgages for £205,000 to consolidate his debts, what will his new LTV be?",
        optionA: "51.4% LTV",
        optionB: "55.7% LTV",
        optionC: "58.6% LTV",
        optionD: "62.3% LTV",
        answer: "C"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Michael owns a property valued at £350,000 with an existing mortgage balance of £180,000. He has £25,000 in unsecured debts (credit cards and a personal loan) with monthly payments totaling £650. His current mortgage payment is £850 per month. Michael earns £55,000 per year and wants to remortgage to consolidate his debts.",
        scenarioId: "scenario-2",
        question: "What is a key risk you should explain to Michael about consolidating unsecured debt into his mortgage?",
        optionA: "His credit score will be permanently damaged",
        optionB: "He will pay less interest overall",
        optionC: "He is converting unsecured debt into debt secured against his home, which could be repossessed if he defaults",
        optionD: "He cannot remortgage again for 10 years",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Michael owns a property valued at £350,000 with an existing mortgage balance of £180,000. He has £25,000 in unsecured debts (credit cards and a personal loan) with monthly payments totaling £650. His current mortgage payment is £850 per month. Michael earns £55,000 per year and wants to remortgage to consolidate his debts.",
        scenarioId: "scenario-2",
        question: "After consolidating his debts, Michael's new mortgage payment would be approximately £975 per month. What is the approximate monthly saving compared to his current total debt obligations?",
        optionA: "£425 per month",
        optionB: "£525 per month",
        optionC: "£625 per month",
        optionD: "£725 per month",
        answer: "B"
      },

      // Scenario 3: Buy-to-Let Investment
      {
        topic: "Mortgage Products",
        scenario: "Linda wants to purchase a buy-to-let property for £220,000. She has a £55,000 deposit. The property would generate a rental income of £1,100 per month. Linda already owns her main residence with a mortgage and earns £48,000 per year from employment. The lender requires rental income to be 125% of the mortgage payment at a stressed rate of 5.5%.",
        scenarioId: "scenario-3",
        question: "What LTV will Linda's buy-to-let mortgage be?",
        optionA: "70% LTV",
        optionB: "75% LTV",
        optionC: "80% LTV",
        optionD: "85% LTV",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Linda wants to purchase a buy-to-let property for £220,000. She has a £55,000 deposit. The property would generate a rental income of £1,100 per month. Linda already owns her main residence with a mortgage and earns £48,000 per year from employment. The lender requires rental income to be 125% of the mortgage payment at a stressed rate of 5.5%.",
        scenarioId: "scenario-3",
        question: "At the stressed rate of 5.5% on a £165,000 mortgage, the monthly payment would be approximately £936. Does the rental income meet the 125% interest coverage ratio?",
        optionA: "No, the rental income is too low",
        optionB: "Yes, but only just",
        optionC: "No, she needs £1,170 per month rental income",
        optionD: "Yes, with a comfortable margin",
        answer: "D"
      },
      {
        topic: "UK Taxation",
        scenario: "Linda wants to purchase a buy-to-let property for £220,000. She has a £55,000 deposit. The property would generate a rental income of £1,100 per month. Linda already owns her main residence with a mortgage and earns £48,000 per year from employment. The lender requires rental income to be 125% of the mortgage payment at a stressed rate of 5.5%.",
        scenarioId: "scenario-3",
        question: "How much Stamp Duty Land Tax (SDLT) will Linda pay as an additional property surcharge on top of the standard rates?",
        optionA: "2% additional surcharge (£4,400 extra)",
        optionB: "3% additional surcharge (£6,600 extra)",
        optionC: "4% additional surcharge (£8,800 extra)",
        optionD: "5% additional surcharge (£11,000 extra)",
        answer: "B"
      },

      // Scenario 4: Self-Employed Applicant
      {
        topic: "Financial Advice Process",
        scenario: "Robert is a self-employed plumber who has been trading for 3 years. His net profit for the last 3 years was: Year 1: £38,000, Year 2: £42,000, Year 3: £46,000. He wants to purchase a property for £265,000 with a £40,000 deposit. Robert has provided 3 years of SA302 forms and tax year overviews from HMRC.",
        scenarioId: "scenario-4",
        question: "How will most lenders calculate Robert's income for affordability purposes?",
        optionA: "Use only the most recent year (£46,000)",
        optionB: "Average the last 2 years (£44,000)",
        optionC: "Average all 3 years (£42,000)",
        optionD: "Use the lowest year to be cautious (£38,000)",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Robert is a self-employed plumber who has been trading for 3 years. His net profit for the last 3 years was: Year 1: £38,000, Year 2: £42,000, Year 3: £46,000. He wants to purchase a property for £265,000 with a £40,000 deposit. Robert has provided 3 years of SA302 forms and tax year overviews from HMRC.",
        scenarioId: "scenario-4",
        question: "Using the average of the last 2 years' income (£44,000) and a typical affordability multiple of 4.5, what is the maximum mortgage Robert could borrow?",
        optionA: "£171,000",
        optionB: "£189,000",
        optionC: "£198,000",
        optionD: "£207,000",
        answer: "C"
      },
      {
        topic: "Mortgage Law",
        scenario: "Robert is a self-employed plumber who has been trading for 3 years. His net profit for the last 3 years was: Year 1: £38,000, Year 2: £42,000, Year 3: £46,000. He wants to purchase a property for £265,000 with a £40,000 deposit. Robert has provided 3 years of SA302 forms and tax year overviews from HMRC.",
        scenarioId: "scenario-4",
        question: "What additional documentation might a lender request from Robert beyond his SA302 forms?",
        optionA: "Only a bank statement",
        optionB: "Business bank statements and potentially accountant's reference",
        optionC: "Just his passport",
        optionD: "No additional documentation needed",
        answer: "B"
      },

      // Scenario 5: Inheritance Tax Planning
      {
        topic: "UK Taxation",
        scenario: "Margaret, aged 72, owns a property worth £550,000 and has savings of £200,000. She is widowed and her late husband's nil-rate band was unused. She wants to gift £100,000 to her daughter now and leave the remainder of her estate to her two children. Margaret's main residence is the £550,000 property where she has lived for 30 years.",
        scenarioId: "scenario-5",
        question: "What is Margaret's combined nil-rate band threshold including her late husband's unused allowance?",
        optionA: "£325,000",
        optionB: "£500,000",
        optionC: "£650,000",
        optionD: "£1,000,000",
        answer: "C"
      },
      {
        topic: "UK Taxation",
        scenario: "Margaret, aged 72, owns a property worth £550,000 and has savings of £200,000. She is widowed and her late husband's nil-rate band was unused. She wants to gift £100,000 to her daughter now and leave the remainder of her estate to her two children. Margaret's main residence is the £550,000 property where she has lived for 30 years.",
        scenarioId: "scenario-5",
        question: "If Margaret makes the £100,000 gift to her daughter and survives for 5 years, what percentage of the gift will be exempt from IHT under taper relief?",
        optionA: "40% exempt (60% chargeable)",
        optionB: "60% exempt (40% chargeable)",
        optionC: "80% exempt (20% chargeable)",
        optionD: "100% exempt (0% chargeable)",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Margaret, aged 72, owns a property worth £550,000 and has savings of £200,000. She is widowed and her late husband's nil-rate band was unused. She wants to gift £100,000 to her daughter now and leave the remainder of her estate to her two children. Margaret's main residence is the £550,000 property where she has lived for 30 years.",
        scenarioId: "scenario-5",
        question: "What is the current residence nil-rate band that Margaret could benefit from when passing her main residence to her children?",
        optionA: "£125,000 per person (£250,000 total including spouse)",
        optionB: "£150,000 per person (£300,000 total including spouse)",
        optionC: "£175,000 per person (£350,000 total including spouse)",
        optionD: "£200,000 per person (£400,000 total including spouse)",
        answer: "C"
      },

      // Scenario 6: Retirement Interest-Only Mortgage
      {
        topic: "Mortgage Products",
        scenario: "David and Susan, both aged 68, own a property worth £420,000 with an existing interest-only mortgage of £150,000 that is maturing. They receive pension income of £32,000 per year combined but have no lump sum to repay the mortgage. They want to switch to a Retirement Interest-Only (RIO) mortgage. They plan to downsize or use the property sale to repay the mortgage when they move into care or pass away.",
        scenarioId: "scenario-6",
        question: "What is the key difference between a standard interest-only mortgage and a Retirement Interest-Only (RIO) mortgage?",
        optionA: "RIO mortgages have higher interest rates",
        optionB: "RIO mortgages have no fixed end date and are repaid from the sale of the property",
        optionC: "RIO mortgages require monthly capital repayments",
        optionD: "RIO mortgages are only available to people over 75",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "David and Susan, both aged 68, own a property worth £420,000 with an existing interest-only mortgage of £150,000 that is maturing. They receive pension income of £32,000 per year combined but have no lump sum to repay the mortgage. They want to switch to a Retirement Interest-Only (RIO) mortgage. They plan to downsize or use the property sale to repay the mortgage when they move into care or pass away.",
        scenarioId: "scenario-6",
        question: "What LTV will David and Susan's RIO mortgage be?",
        optionA: "30.7% LTV",
        optionB: "35.7% LTV",
        optionC: "40.7% LTV",
        optionD: "45.7% LTV",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "David and Susan, both aged 68, own a property worth £420,000 with an existing interest-only mortgage of £150,000 that is maturing. They receive pension income of £32,000 per year combined but have no lump sum to repay the mortgage. They want to switch to a Retirement Interest-Only (RIO) mortgage. They plan to downsize or use the property sale to repay the mortgage when they move into care or pass away.",
        scenarioId: "scenario-6",
        question: "At an interest rate of 4.5%, what would David and Susan's monthly interest payment be on their £150,000 RIO mortgage?",
        optionA: "£462.50",
        optionB: "£562.50",
        optionC: "£662.50",
        optionD: "£762.50",
        answer: "B"
      },

      // Scenario 7: Help to Buy Equity Loan
      {
        topic: "Mortgage Products",
        scenario: "Emma is a first-time buyer purchasing a new-build property in England for £300,000. She has a £15,000 deposit (5%) and is using the Help to Buy equity loan scheme. The government will lend her 20% equity (£60,000), and she needs a mortgage for the remaining 75% (£225,000). Emma earns £35,000 per year.",
        scenarioId: "scenario-7",
        question: "For the first 5 years of the Help to Buy equity loan, what interest does Emma pay on the £60,000 equity loan?",
        optionA: "0% interest (interest-free period)",
        optionB: "1.75% interest from year one",
        optionC: "2.5% interest from year one",
        optionD: "Bank of England base rate plus 1%",
        answer: "A"
      },
      {
        topic: "Mortgage Products",
        scenario: "Emma is a first-time buyer purchasing a new-build property in England for £300,000. She has a £15,000 deposit (5%) and is using the Help to Buy equity loan scheme. The government will lend her 20% equity (£60,000), and she needs a mortgage for the remaining 75% (£225,000). Emma earns £35,000 per year.",
        scenarioId: "scenario-7",
        question: "After 5 years, the Help to Buy equity loan interest rate is charged at:",
        optionA: "1.5% fixed rate",
        optionB: "1.75% of the equity loan value, increasing annually by RPI plus 1%",
        optionC: "2.75% of the equity loan value, increasing annually by RPI plus 2%",
        optionD: "Bank of England base rate only",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        scenario: "Emma is a first-time buyer purchasing a new-build property in England for £300,000. She has a £15,000 deposit (5%) and is using the Help to Buy equity loan scheme. The government will lend her 20% equity (£60,000), and she needs a mortgage for the remaining 75% (£225,000). Emma earns £35,000 per year.",
        scenarioId: "scenario-7",
        question: "When Emma sells the property or repays the Help to Buy loan, how much must she repay?",
        optionA: "Exactly £60,000 regardless of property value",
        optionB: "£60,000 plus interest accrued",
        optionC: "20% of the property's current market value",
        optionD: "£60,000 adjusted for inflation",
        answer: "C"
      },

      // Scenario 8: Joint Borrower Sole Proprietor
      {
        topic: "Mortgage Products",
        scenario: "Tom, aged 28, wants to buy his first home for £240,000. He earns £30,000 per year and has a £12,000 deposit. His mother, who already owns her own home outright, has offered to be a joint borrower to help him qualify for a larger mortgage. She earns £38,000 per year. Tom will be the sole owner of the property, but his mother will be jointly liable for the mortgage.",
        scenarioId: "scenario-8",
        question: "Using a 4.5 times income multiple on their combined income, what is the maximum mortgage Tom and his mother could borrow together?",
        optionA: "£276,000",
        optionB: "£294,000",
        optionC: "£306,000",
        optionD: "£324,000",
        answer: "C"
      },
      {
        topic: "UK Taxation",
        scenario: "Tom, aged 28, wants to buy his first home for £240,000. He earns £30,000 per year and has a £12,000 deposit. His mother, who already owns her own home outright, has offered to be a joint borrower to help him qualify for a larger mortgage. She earns £38,000 per year. Tom will be the sole owner of the property, but his mother will be jointly liable for the mortgage.",
        scenarioId: "scenario-8",
        question: "Will Tom's mother have to pay the 3% SDLT surcharge for additional properties even though she won't own Tom's property?",
        optionA: "Yes, because she is a joint borrower on a second mortgage",
        optionB: "No, because she is not on the title deeds as an owner",
        optionC: "Yes, but only on 50% of the property value",
        optionD: "Yes, unless she sells her own property first",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Tom, aged 28, wants to buy his first home for £240,000. He earns £30,000 per year and has a £12,000 deposit. His mother, who already owns her own home outright, has offered to be a joint borrower to help him qualify for a larger mortgage. She earns £38,000 per year. Tom will be the sole owner of the property, but his mother will be jointly liable for the mortgage.",
        scenarioId: "scenario-8",
        question: "What is a key risk you should explain to Tom's mother about being a joint borrower sole proprietor?",
        optionA: "She will automatically inherit the property",
        optionB: "She is fully liable for the mortgage debt but has no legal ownership of the property",
        optionC: "She cannot remortgage her own property",
        optionD: "She must live in Tom's property",
        answer: "B"
      },

      // Scenario 9: Protection Insurance Needs
      {
        topic: "Protection Products",
        scenario: "Helen and Mark, both aged 35, have just taken out a £280,000 repayment mortgage over 25 years. Helen earns £42,000 and Mark earns £38,000. They have two children aged 5 and 7. They have no existing life insurance or critical illness cover. Their monthly mortgage payment is £1,330.",
        scenarioId: "scenario-9",
        question: "What type of life insurance would be most cost-effective to cover their repayment mortgage?",
        optionA: "Level term assurance for £280,000",
        optionB: "Decreasing term assurance for £280,000",
        optionC: "Whole of life assurance for £280,000",
        optionD: "Endowment policy for £280,000",
        answer: "B"
      },
      {
        topic: "Protection Products",
        scenario: "Helen and Mark, both aged 35, have just taken out a £280,000 repayment mortgage over 25 years. Helen earns £42,000 and Mark earns £38,000. They have two children aged 5 and 7. They have no existing life insurance or critical illness cover. Their monthly mortgage payment is £1,330.",
        scenarioId: "scenario-9",
        question: "If Helen wanted to ensure her family could maintain their standard of living if she died, how much life cover should she consider (using a typical multiple of 10 times income)?",
        optionA: "£280,000",
        optionB: "£320,000",
        optionC: "£380,000",
        optionD: "£420,000",
        answer: "D"
      },
      {
        topic: "Protection Products",
        scenario: "Helen and Mark, both aged 35, have just taken out a £280,000 repayment mortgage over 25 years. Helen earns £42,000 and Mark earns £38,000. They have two children aged 5 and 7. They have no existing life insurance or critical illness cover. Their monthly mortgage payment is £1,330.",
        scenarioId: "scenario-9",
        question: "What is the key benefit of adding critical illness cover to their life insurance policy?",
        optionA: "It costs less than life insurance alone",
        optionB: "It pays out if they are diagnosed with a specified critical illness, even if they survive",
        optionC: "It covers any illness or injury",
        optionD: "It replaces their income indefinitely",
        answer: "B"
      },

      // Scenario 10: Shared Ownership
      {
        topic: "Mortgage Products",
        scenario: "Aisha wants to purchase a shared ownership property valued at £200,000. She will buy a 50% share (£100,000) and pay rent on the remaining 50% to a housing association. Aisha has a £10,000 deposit and earns £28,000 per year. The monthly rent on the 50% share is £425. Aisha plans to 'staircase' to 100% ownership over time.",
        scenarioId: "scenario-10",
        question: "What LTV will Aisha's mortgage be based on the share she is purchasing?",
        optionA: "85% LTV",
        optionB: "90% LTV",
        optionC: "95% LTV",
        optionD: "100% LTV",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Aisha wants to purchase a shared ownership property valued at £200,000. She will buy a 50% share (£100,000) and pay rent on the remaining 50% to a housing association. Aisha has a £10,000 deposit and earns £28,000 per year. The monthly rent on the 50% share is £425. Aisha plans to 'staircase' to 100% ownership over time.",
        scenarioId: "scenario-10",
        question: "What does 'staircasing' mean in shared ownership?",
        optionA: "Paying off the mortgage faster",
        optionB: "Buying additional shares in the property, increasing ownership percentage",
        optionC: "Renovating the property",
        optionD: "Moving to a larger shared ownership property",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Aisha wants to purchase a shared ownership property valued at £200,000. She will buy a 50% share (£100,000) and pay rent on the remaining 50% to a housing association. Aisha has a £10,000 deposit and earns £28,000 per year. The monthly rent on the 50% share is £425. Aisha plans to 'staircase' to 100% ownership over time.",
        scenarioId: "scenario-10",
        question: "For Stamp Duty Land Tax purposes, how is Aisha's shared ownership purchase treated if she pays SDLT on the market value upfront?",
        optionA: "She pays SDLT only on the share she is buying (£100,000)",
        optionB: "She pays SDLT on the full market value (£200,000) and no further SDLT when staircasing",
        optionC: "She pays no SDLT on shared ownership properties",
        optionD: "She pays double SDLT because it's shared ownership",
        answer: "B"
      },

      // Scenario 11: Adverse Credit History
      {
        topic: "Financial Advice Process",
        scenario: "Paul, aged 32, wants to purchase a property for £195,000 with a £29,250 deposit (15%). He earns £36,000 per year. Paul had a County Court Judgment (CCJ) for £1,200 that was registered 18 months ago, which he has now fully settled. He also missed 2 credit card payments 12 months ago but has maintained a clean record since then.",
        scenarioId: "scenario-11",
        question: "How long do County Court Judgments (CCJs) remain on a credit file?",
        optionA: "3 years from registration",
        optionB: "5 years from registration",
        optionC: "6 years from registration",
        optionD: "10 years from registration",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Paul, aged 32, wants to purchase a property for £195,000 with a £29,250 deposit (15%). He earns £36,000 per year. Paul had a County Court Judgment (CCJ) for £1,200 that was registered 18 months ago, which he has now fully settled. He also missed 2 credit card payments 12 months ago but has maintained a clean record since then.",
        scenarioId: "scenario-11",
        question: "Given Paul's adverse credit history, what type of lender should you research for him?",
        optionA: "Standard high-street lenders only",
        optionB: "Specialist lenders who accept adverse credit with satisfied CCJs",
        optionC: "Only government-backed schemes",
        optionD: "Building societies only",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Paul, aged 32, wants to purchase a property for £195,000 with a £29,250 deposit (15%). He earns £36,000 per year. Paul had a County Court Judgment (CCJ) for £1,200 that was registered 18 months ago, which he has now fully settled. He also missed 2 credit card payments 12 months ago but has maintained a clean record since then.",
        scenarioId: "scenario-11",
        question: "What impact will Paul's adverse credit likely have on his mortgage?",
        optionA: "No impact at all",
        optionB: "He will be declined by all lenders",
        optionC: "He may face higher interest rates and lower LTV limits",
        optionD: "He must wait 6 years before applying",
        answer: "C"
      },

      // Scenario 12: Offset Mortgage
      {
        topic: "Mortgage Products",
        scenario: "Raj and Priya have a mortgage of £250,000 at 4.5% interest. They have £40,000 in savings earning 2% interest in a standard savings account (taxable). They are both higher-rate taxpayers (40%). Their lender offers an offset mortgage at 4.6% interest where their savings would be offset against the mortgage balance, reducing the interest charged.",
        scenarioId: "scenario-12",
        question: "If Raj and Priya offset their £40,000 savings against their £250,000 mortgage, what balance will interest be charged on?",
        optionA: "£250,000 (no change)",
        optionB: "£230,000",
        optionC: "£210,000",
        optionD: "£200,000",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Raj and Priya have a mortgage of £250,000 at 4.5% interest. They have £40,000 in savings earning 2% interest in a standard savings account (taxable). They are both higher-rate taxpayers (40%). Their lender offers an offset mortgage at 4.6% interest where their savings would be offset against the mortgage balance, reducing the interest charged.",
        scenarioId: "scenario-12",
        question: "As higher-rate taxpayers, what is Raj and Priya's effective after-tax return on their savings account earning 2% interest?",
        optionA: "0.8% after tax",
        optionB: "1.2% after tax",
        optionC: "1.5% after tax",
        optionD: "2.0% (no tax impact)",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Raj and Priya have a mortgage of £250,000 at 4.5% interest. They have £40,000 in savings earning 2% interest in a standard savings account (taxable). They are both higher-rate taxpayers (40%). Their lender offers an offset mortgage at 4.6% interest where their savings would be offset against the mortgage balance, reducing the interest charged.",
        scenarioId: "scenario-12",
        question: "What is a key advantage of an offset mortgage for higher-rate taxpayers like Raj and Priya?",
        optionA: "The savings are locked away and cannot be accessed",
        optionB: "They receive tax-free interest on their savings",
        optionC: "They effectively earn the mortgage interest rate (4.6%) tax-free on their savings by reducing mortgage interest",
        optionD: "The mortgage rate is always lower than standard mortgages",
        answer: "C"
      },

      // Scenario 13: Bridging Loan
      {
        topic: "Mortgage Products",
        scenario: "Claire has found her dream home for £450,000 but hasn't sold her current property yet (valued at £320,000 with £80,000 mortgage remaining). She needs to complete the purchase within 4 weeks. A bridging loan provider offers her a 12-month loan at 0.75% per month interest. Claire is confident she can sell her current property within 6 months.",
        scenarioId: "scenario-13",
        question: "If Claire borrows £450,000 for 6 months at 0.75% per month, approximately how much interest will she pay?",
        optionA: "£16,875",
        optionB: "£20,250",
        optionC: "£27,000",
        optionD: "£33,750",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Claire has found her dream home for £450,000 but hasn't sold her current property yet (valued at £320,000 with £80,000 mortgage remaining). She needs to complete the purchase within 4 weeks. A bridging loan provider offers her a 12-month loan at 0.75% per month interest. Claire is confident she can sell her current property within 6 months.",
        scenarioId: "scenario-13",
        question: "What is the main risk Claire faces with this bridging loan?",
        optionA: "The interest rate is fixed",
        optionB: "If her property doesn't sell within 12 months, she may face significant penalty charges and financial difficulty",
        optionC: "She cannot move into the new property",
        optionD: "The lender will own both properties",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Claire has found her dream home for £450,000 but hasn't sold her current property yet (valued at £320,000 with £80,000 mortgage remaining). She needs to complete the purchase within 4 weeks. A bridging loan provider offers her a 12-month loan at 0.75% per month interest. Claire is confident she can sell her current property within 6 months.",
        scenarioId: "scenario-13",
        question: "What exit strategy should Claire have in place for this bridging loan?",
        optionA: "Hope for the best",
        optionB: "A clear plan to repay, typically through sale of existing property or long-term mortgage",
        optionC: "Extend the bridging loan indefinitely",
        optionD: "Use credit cards to repay",
        answer: "B"
      },

      // Scenario 14: Lifetime Mortgage (Equity Release)
      {
        topic: "Mortgage Products",
        scenario: "Geoffrey, aged 73, owns his home worth £380,000 outright. He wants to release equity to fund home improvements and help his grandchildren. He's considering a lifetime mortgage that would lend him £95,000 at a fixed rate of 5.5% per year, with interest rolling up. Geoffrey plans to stay in the property for the rest of his life.",
        scenarioId: "scenario-14",
        question: "What is the Loan-to-Value (LTV) of Geoffrey's lifetime mortgage at inception?",
        optionA: "20%",
        optionB: "25%",
        optionC: "30%",
        optionD: "35%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Geoffrey, aged 73, owns his home worth £380,000 outright. He wants to release equity to fund home improvements and help his grandchildren. He's considering a lifetime mortgage that would lend him £95,000 at a fixed rate of 5.5% per year, with interest rolling up. Geoffrey plans to stay in the property for the rest of his life.",
        scenarioId: "scenario-14",
        question: "If Geoffrey lives for another 15 years without making any repayments, approximately how much will be owed (using compound interest at 5.5%)?",
        optionA: "£173,625",
        optionB: "£196,450",
        optionC: "£213,875",
        optionD: "£225,100",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Geoffrey, aged 73, owns his home worth £380,000 outright. He wants to release equity to fund home improvements and help his grandchildren. He's considering a lifetime mortgage that would lend him £95,000 at a fixed rate of 5.5% per year, with interest rolling up. Geoffrey plans to stay in the property for the rest of his life.",
        scenarioId: "scenario-14",
        question: "What is a key protection feature required in modern lifetime mortgages?",
        optionA: "The debt can exceed the property value",
        optionB: "A 'no negative equity guarantee' ensuring the debt never exceeds the property value",
        optionC: "Interest rates can double after 5 years",
        optionD: "The lender can force sale at any time",
        answer: "B"
      },

      // Scenario 15: Right to Buy
      {
        topic: "Mortgage Products",
        scenario: "Yasmin is a council tenant who has lived in her property for 8 years. The property is valued at £180,000. Under Right to Buy, she receives a 35% discount (£63,000), meaning she can purchase for £117,000. Yasmin earns £26,000 per year and has saved £6,000 for costs.",
        scenarioId: "scenario-15",
        question: "What LTV mortgage does Yasmin need to purchase her council property?",
        optionA: "90% LTV (£105,300)",
        optionB: "95% LTV (£111,150)",
        optionC: "100% LTV (£117,000)",
        optionD: "85% LTV (£99,450)",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        scenario: "Yasmin is a council tenant who has lived in her property for 8 years. The property is valued at £180,000. Under Right to Buy, she receives a 35% discount (£63,000), meaning she can purchase for £117,000. Yasmin earns £26,000 per year and has saved £6,000 for costs.",
        scenarioId: "scenario-15",
        question: "If Yasmin sells her Right to Buy property within 5 years, what restriction applies?",
        optionA: "No restrictions apply",
        optionB: "She must repay a portion of the discount on a sliding scale",
        optionC: "She must pay double council tax",
        optionD: "She cannot sell at all",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Yasmin is a council tenant who has lived in her property for 8 years. The property is valued at £180,000. Under Right to Buy, she receives a 35% discount (£63,000), meaning she can purchase for £117,000. Yasmin earns £26,000 per year and has saved £6,000 for costs.",
        scenarioId: "scenario-15",
        question: "Using a 4.5 income multiple, what is the maximum mortgage Yasmin could borrow?",
        optionA: "£108,000",
        optionB: "£117,000",
        optionC: "£126,000",
        optionD: "£135,000",
        answer: "B"
      },

      // Scenario 16: Portfolio Landlord
      {
        topic: "Mortgage Products",
        scenario: "Neil owns 5 buy-to-let properties with a total mortgage debt of £620,000. The properties are worth £1,200,000 combined and generate £4,800 per month rental income. Neil wants to purchase a 6th property for £185,000 with a £50,000 deposit. Under PRA rules, Neil is classified as a portfolio landlord.",
        scenarioId: "scenario-16",
        question: "What is the aggregate LTV across Neil's existing portfolio?",
        optionA: "48.7%",
        optionB: "51.7%",
        optionC: "54.7%",
        optionD: "57.7%",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Neil owns 5 buy-to-let properties with a total mortgage debt of £620,000. The properties are worth £1,200,000 combined and generate £4,800 per month rental income. Neil wants to purchase a 6th property for £185,000 with a £50,000 deposit. Under PRA rules, Neil is classified as a portfolio landlord.",
        scenarioId: "scenario-16",
        question: "As a portfolio landlord (4 or more mortgaged properties), what additional assessment must Neil undergo?",
        optionA: "No additional requirements",
        optionB: "More stringent affordability assessment looking at the entire portfolio",
        optionC: "He must use a commercial mortgage",
        optionD: "He cannot borrow anymore",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Neil owns 5 buy-to-let properties with a total mortgage debt of £620,000. The properties are worth £1,200,000 combined and generate £4,800 per month rental income. Neil wants to purchase a 6th property for £185,000 with a £50,000 deposit. Under PRA rules, Neil is classified as a portfolio landlord.",
        scenarioId: "scenario-16",
        question: "Under current tax rules, how is mortgage interest relief calculated for buy-to-let landlords?",
        optionA: "Full mortgage interest is deducted from rental income",
        optionB: "20% tax credit on mortgage interest paid",
        optionC: "No relief available",
        optionD: "50% of mortgage interest is deducted",
        answer: "B"
      },

      // Scenario 17: Second Charge Mortgage
      {
        topic: "Mortgage Products",
        scenario: "Andrea owns a property worth £340,000 with a £190,000 first charge mortgage at 3.2% (2 years remaining on fixed term, £8,500 ERC). She needs £35,000 for a business investment. A second charge lender offers her a loan at 7.5% interest over 10 years with no ERC on her existing mortgage.",
        scenarioId: "scenario-17",
        question: "What is Andrea's current LTV on her first charge mortgage?",
        optionA: "52.9%",
        optionB: "55.9%",
        optionC: "58.9%",
        optionD: "61.9%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Andrea owns a property worth £340,000 with a £190,000 first charge mortgage at 3.2% (2 years remaining on fixed term, £8,500 ERC). She needs £35,000 for a business investment. A second charge lender offers her a loan at 7.5% interest over 10 years with no ERC on her existing mortgage.",
        scenarioId: "scenario-17",
        question: "What is the combined LTV if Andrea takes the second charge mortgage?",
        optionA: "62.2%",
        optionB: "66.2%",
        optionC: "70.2%",
        optionD: "74.2%",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Andrea owns a property worth £340,000 with a £190,000 first charge mortgage at 3.2% (2 years remaining on fixed term, £8,500 ERC). She needs £35,000 for a business investment. A second charge lender offers her a loan at 7.5% interest over 10 years with no ERC on her existing mortgage.",
        scenarioId: "scenario-17",
        question: "Why might Andrea choose a second charge mortgage instead of remortgaging?",
        optionA: "Second charge mortgages always have better rates",
        optionB: "To avoid the £8,500 ERC and keep her competitive 3.2% rate on the first charge",
        optionC: "Second charge mortgages don't require affordability checks",
        optionD: "She doesn't need a solicitor",
        answer: "B"
      },

      // Scenario 18: Islamic Finance (Sharia-Compliant)
      {
        topic: "Mortgage Products",
        scenario: "Fatima wants to purchase a property for £275,000 using Sharia-compliant finance. She has a £55,000 deposit. The Islamic bank uses a Diminishing Musharaka structure where the bank and Fatima co-own the property, and Fatima pays rent on the bank's share while gradually buying it out over 25 years.",
        scenarioId: "scenario-18",
        question: "What LTV is Fatima's Islamic finance arrangement?",
        optionA: "75%",
        optionB: "80%",
        optionC: "85%",
        optionD: "90%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Fatima wants to purchase a property for £275,000 using Sharia-compliant finance. She has a £55,000 deposit. The Islamic bank uses a Diminishing Musharaka structure where the bank and Fatima co-own the property, and Fatima pays rent on the bank's share while gradually buying it out over 25 years.",
        scenarioId: "scenario-18",
        question: "How does Islamic finance differ from conventional mortgages?",
        optionA: "It charges lower interest rates",
        optionB: "It doesn't charge interest (riba); instead uses profit-sharing or rental structures",
        optionC: "It requires no deposit",
        optionD: "It only finances commercial properties",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Fatima wants to purchase a property for £275,000 using Sharia-compliant finance. She has a £55,000 deposit. The Islamic bank uses a Diminishing Musharaka structure where the bank and Fatima co-own the property, and Fatima pays rent on the bank's share while gradually buying it out over 25 years.",
        scenarioId: "scenario-18",
        question: "For SDLT purposes, how is Fatima's Islamic finance purchase treated?",
        optionA: "She pays SDLT twice - once for the initial share and again when buying out the bank",
        optionB: "She pays SDLT on the full purchase price upfront (£275,000) with relief provisions",
        optionC: "Islamic finance is exempt from SDLT",
        optionD: "She pays no SDLT until full ownership",
        answer: "B"
      },

      // Scenario 19: Green Mortgage
      {
        topic: "Mortgage Products",
        scenario: "Oliver is purchasing an energy-efficient new-build property for £310,000 with an EPC rating of A. His lender offers a green mortgage with a 0.15% interest rate reduction (from 4.5% to 4.35%) and £500 cashback. Oliver has a £31,000 deposit (10%) and earns £54,000 per year.",
        scenarioId: "scenario-19",
        question: "What is Oliver's LTV for this green mortgage?",
        optionA: "85%",
        optionB: "88%",
        optionC: "90%",
        optionD: "92%",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Oliver is purchasing an energy-efficient new-build property for £310,000 with an EPC rating of A. His lender offers a green mortgage with a 0.15% interest rate reduction (from 4.5% to 4.35%) and £500 cashback. Oliver has a £31,000 deposit (10%) and earns £54,000 per year.",
        scenarioId: "scenario-19",
        question: "Over a 25-year mortgage term, approximately how much will Oliver save per month due to the 0.15% rate reduction on his £279,000 mortgage?",
        optionA: "£18 per month",
        optionB: "£23 per month",
        optionC: "£28 per month",
        optionD: "£35 per month",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Oliver is purchasing an energy-efficient new-build property for £310,000 with an EPC rating of A. His lender offers a green mortgage with a 0.15% interest rate reduction (from 4.5% to 4.35%) and £500 cashback. Oliver has a £31,000 deposit (10%) and earns £54,000 per year.",
        scenarioId: "scenario-19",
        question: "What EPC rating typically qualifies for green mortgage incentives?",
        optionA: "Rating D or above",
        optionB: "Rating C or above",
        optionC: "Rating B or above (typically A or B)",
        optionD: "Any rating with solar panels",
        answer: "C"
      },

      // Scenario 20: Forces Help to Buy
      {
        topic: "Mortgage Products",
        scenario: "Corporal James, serving in the British Army for 6 years, wants to buy his first home for £220,000. He has saved £11,000 and is eligible for the Forces Help to Buy scheme which provides an interest-free loan of up to 50% of his salary (£28,000 base salary) for a maximum of £25,000.",
        scenarioId: "scenario-20",
        question: "If James uses the full Forces Help to Buy loan of £14,000 (50% of £28,000) along with his savings, what LTV mortgage will he need?",
        optionA: "85.9%",
        optionB: "88.6%",
        optionC: "91.4%",
        optionD: "94.5%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Corporal James, serving in the British Army for 6 years, wants to buy his first home for £220,000. He has saved £11,000 and is eligible for the Forces Help to Buy scheme which provides an interest-free loan of up to 50% of his salary (£28,000 base salary) for a maximum of £25,000.",
        scenarioId: "scenario-20",
        question: "How long is the Forces Help to Buy loan interest-free?",
        optionA: "3 years",
        optionB: "5 years",
        optionC: "10 years",
        optionD: "Interest-free for the full duration until repaid",
        answer: "C"
      },
      {
        topic: "Mortgage Law",
        scenario: "Corporal James, serving in the British Army for 6 years, wants to buy his first home for £220,000. He has saved £11,000 and is eligible for the Forces Help to Buy scheme which provides an interest-free loan of up to 50% of his salary (£28,000 base salary) for a maximum of £25,000.",
        scenarioId: "scenario-20",
        question: "When must James repay the Forces Help to Buy loan?",
        optionA: "When he leaves the armed forces, sells the property, or after 10 years (whichever comes first)",
        optionB: "After exactly 10 years",
        optionC: "Never - it's a grant",
        optionD: "Only if he sells within 5 years",
        answer: "A"
      },

      // Scenario 21: New Build Premium
      {
        topic: "Mortgage Products",
        scenario: "Sophie is purchasing a new-build apartment for £245,000 from a developer. Identical resale apartments in the same development sold for £220,000 last month. Sophie has a £37,000 deposit and the developer is offering 5% deposit contribution and paying her stamp duty. Her lender will value the property.",
        scenarioId: "scenario-21",
        question: "What is the typical 'new build premium' Sophie is paying compared to resale value?",
        optionA: "8.5%",
        optionB: "11.4%",
        optionC: "14.3%",
        optionD: "17.2%",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Sophie is purchasing a new-build apartment for £245,000 from a developer. Identical resale apartments in the same development sold for £220,000 last month. Sophie has a £37,000 deposit and the developer is offering 5% deposit contribution and paying her stamp duty. Her lender will value the property.",
        scenarioId: "scenario-21",
        question: "What risk should you explain to Sophie about new build properties?",
        optionA: "They appreciate faster than resale properties",
        optionB: "There's a risk of negative equity if the property is valued lower than purchase price by the lender or market",
        optionC: "New builds cannot be remortgaged",
        optionD: "She will pay double council tax",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        scenario: "Sophie is purchasing a new-build apartment for £245,000 from a developer. Identical resale apartments in the same development sold for £220,000 last month. Sophie has a £37,000 deposit and the developer is offering 5% deposit contribution and paying her stamp duty. Her lender will value the property.",
        scenarioId: "scenario-21",
        question: "If the lender values Sophie's property at £220,000 (market value) rather than £245,000 (purchase price), what LTV will she actually have?",
        optionA: "83.2%",
        optionB: "89.1%",
        optionC: "94.5%",
        optionD: "100%+",
        answer: "C"
      },

      // Scenario 22: Leasehold Property Purchase
      {
        topic: "Mortgage Law",
        scenario: "Marcus is buying a leasehold flat for £198,000 with 85 years remaining on the lease. The annual ground rent is £250, and the service charge is £1,200 per year. Marcus has a £30,000 deposit. Most lenders require a minimum of 80 years remaining at the end of the mortgage term.",
        scenarioId: "scenario-22",
        question: "On a 25-year mortgage, how many years will be left on the lease at the end of the term?",
        optionA: "50 years",
        optionB: "55 years",
        optionC: "60 years",
        optionD: "65 years",
        answer: "C"
      },
      {
        topic: "Mortgage Law",
        scenario: "Marcus is buying a leasehold flat for £198,000 with 85 years remaining on the lease. The annual ground rent is £250, and the service charge is £1,200 per year. Marcus has a £30,000 deposit. Most lenders require a minimum of 80 years remaining at the end of the mortgage term.",
        scenarioId: "scenario-22",
        question: "What typically happens when a lease drops below 80 years?",
        optionA: "Nothing changes",
        optionB: "The property becomes harder to sell and mortgage, and lease extension costs increase significantly due to 'marriage value'",
        optionC: "The property automatically becomes freehold",
        optionD: "Ground rent doubles",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Marcus is buying a leasehold flat for £198,000 with 85 years remaining on the lease. The annual ground rent is £250, and the service charge is £1,200 per year. Marcus has a £30,000 deposit. Most lenders require a minimum of 80 years remaining at the end of the mortgage term.",
        scenarioId: "scenario-22",
        question: "What are the monthly costs Marcus must budget for in addition to his mortgage payment?",
        optionA: "£75 per month (ground rent only)",
        optionB: "£100 per month (service charge only)",
        optionC: "£121 per month (ground rent and service charge)",
        optionD: "No additional costs",
        answer: "C"
      },

      // Scenario 23: Capital Gains Tax on Second Home
      {
        topic: "UK Taxation",
        scenario: "Emma sold her buy-to-let property for £385,000 which she purchased 8 years ago for £245,000. During ownership, she spent £18,000 on improvements (new kitchen and bathroom). Emma is a higher-rate taxpayer (40%). Selling costs including estate agent fees and legal fees totaled £6,500.",
        scenarioId: "scenario-23",
        question: "What is Emma's chargeable gain after deducting allowable costs?",
        optionA: "£115,500",
        optionB: "£122,000",
        optionC: "£133,500",
        optionD: "£140,000",
        answer: "A"
      },
      {
        topic: "UK Taxation",
        scenario: "Emma sold her buy-to-let property for £385,000 which she purchased 8 years ago for £245,000. During ownership, she spent £18,000 on improvements (new kitchen and bathroom). Emma is a higher-rate taxpayer (40%). Selling costs including estate agent fees and legal fees totaled £6,500.",
        scenarioId: "scenario-23",
        question: "What is the current annual CGT allowance (for tax year 2024/25)?",
        optionA: "£3,000",
        optionB: "£6,000",
        optionC: "£12,300",
        optionD: "£12,570",
        answer: "A"
      },
      {
        topic: "UK Taxation",
        scenario: "Emma sold her buy-to-let property for £385,000 which she purchased 8 years ago for £245,000. During ownership, she spent £18,000 on improvements (new kitchen and bathroom). Emma is a higher-rate taxpayer (40%). Selling costs including estate agent fees and legal fees totaled £6,500.",
        scenarioId: "scenario-23",
        question: "As a higher-rate taxpayer, what CGT rate does Emma pay on property gains?",
        optionA: "18%",
        optionB: "20%",
        optionC: "24%",
        optionD: "28%",
        answer: "C"
      },

      // Scenario 24: Income Protection Insurance
      {
        topic: "Protection Products",
        scenario: "Ryan, aged 40, is self-employed earning £48,000 per year. He has a mortgage of £215,000 with monthly payments of £1,180. Ryan is considering income protection insurance that would pay 60% of his gross income after a 13-week deferred period until age 65 or return to work.",
        scenarioId: "scenario-24",
        question: "How much monthly benefit would Ryan receive from this income protection policy?",
        optionA: "£1,800",
        optionB: "£2,200",
        optionC: "£2,400",
        optionD: "£2,880",
        answer: "C"
      },
      {
        topic: "Protection Products",
        scenario: "Ryan, aged 40, is self-employed earning £48,000 per year. He has a mortgage of £215,000 with monthly payments of £1,180. Ryan is considering income protection insurance that would pay 60% of his gross income after a 13-week deferred period until age 65 or return to work.",
        scenarioId: "scenario-24",
        question: "What does the 13-week 'deferred period' mean?",
        optionA: "The policy starts paying immediately",
        optionB: "Ryan must be unable to work for 13 weeks before payments begin",
        optionC: "The policy lasts only 13 weeks",
        optionD: "Ryan pays premiums for 13 weeks then stops",
        answer: "B"
      },
      {
        topic: "Protection Products",
        scenario: "Ryan, aged 40, is self-employed earning £48,000 per year. He has a mortgage of £215,000 with monthly payments of £1,180. Ryan is considering income protection insurance that would pay 60% of his gross income after a 13-week deferred period until age 65 or return to work.",
        scenarioId: "scenario-24",
        question: "Why do insurers typically limit income protection to 50-60% of gross income?",
        optionA: "To keep premiums low",
        optionB: "To avoid over-insurance and maintain incentive to return to work",
        optionC: "Because it's the legal maximum",
        optionD: "To match mortgage payments exactly",
        answer: "B"
      },

      // Scenario 25: Transfer of Equity (Divorce)
      {
        topic: "Mortgage Law",
        scenario: "Karen and Steve are divorcing. They jointly own a property worth £320,000 with a £140,000 mortgage. As part of the divorce settlement, Steve is transferring his 50% share to Karen. Karen earns £44,000 per year and needs to pass affordability checks to take on the full mortgage solely in her name.",
        scenarioId: "scenario-25",
        question: "Using a 4.5 income multiple, can Karen afford to take on the £140,000 mortgage on her salary alone?",
        optionA: "No, she can only borrow £108,000",
        optionB: "No, she can only borrow £132,000",
        optionC: "Yes, she can borrow up to £198,000",
        optionD: "Yes, but only just at £140,000",
        answer: "C"
      },
      {
        topic: "UK Taxation",
        scenario: "Karen and Steve are divorcing. They jointly own a property worth £320,000 with a £140,000 mortgage. As part of the divorce settlement, Steve is transferring his 50% share to Karen. Karen earns £44,000 per year and needs to pass affordability checks to take on the full mortgage solely in her name.",
        scenarioId: "scenario-25",
        question: "Will Karen have to pay Stamp Duty Land Tax on Steve's 50% share transfer?",
        optionA: "Yes, full SDLT on £160,000",
        optionB: "Yes, but only on equity above the mortgage",
        optionC: "No, transfers between divorcing spouses are exempt from SDLT",
        optionD: "Yes, plus the 3% surcharge",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Karen and Steve are divorcing. They jointly own a property worth £320,000 with a £140,000 mortgage. As part of the divorce settlement, Steve is transferring his 50% share to Karen. Karen earns £44,000 per year and needs to pass affordability checks to take on the full mortgage solely in her name.",
        scenarioId: "scenario-25",
        question: "What is the current LTV on the property?",
        optionA: "38.5%",
        optionB: "43.8%",
        optionC: "47.2%",
        optionD: "51.6%",
        answer: "B"
      },

      // Scenario 26: Guarantor Mortgage
      {
        topic: "Mortgage Products",
        scenario: "Lucy, aged 24, earns £25,000 per year and wants to buy a £175,000 property. She has only a £5,000 deposit. Her father has agreed to act as guarantor, pledging his own mortgage-free property (worth £280,000) as additional security. Using a 4.5 income multiple, Lucy can only borrow £112,500 on her income alone.",
        scenarioId: "scenario-26",
        question: "What LTV would Lucy need without the guarantor arrangement?",
        optionA: "95.7%",
        optionB: "97.1%",
        optionC: "98.6%",
        optionD: "100%+",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Lucy, aged 24, earns £25,000 per year and wants to buy a £175,000 property. She has only a £5,000 deposit. Her father has agreed to act as guarantor, pledging his own mortgage-free property (worth £280,000) as additional security. Using a 4.5 income multiple, Lucy can only borrow £112,500 on her income alone.",
        scenarioId: "scenario-26",
        question: "What is the key risk for Lucy's father as guarantor?",
        optionA: "His credit score will be affected even if Lucy pays",
        optionB: "If Lucy defaults, he is liable for the debt and his property could be repossessed",
        optionC: "He automatically becomes joint owner of Lucy's property",
        optionD: "He cannot remortgage his own property ever again",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Lucy, aged 24, earns £25,000 per year and wants to buy a £175,000 property. She has only a £5,000 deposit. Her father has agreed to act as guarantor, pledging his own mortgage-free property (worth £280,000) as additional security. Using a 4.5 income multiple, Lucy can only borrow £112,500 on her income alone.",
        scenarioId: "scenario-26",
        question: "How much would Lucy be short if borrowing on her income alone without the guarantor?",
        optionA: "£47,500",
        optionB: "£52,500",
        optionC: "£57,500",
        optionD: "£62,500",
        answer: "C"
      },

      // Scenario 27: Let-to-Buy
      {
        topic: "Mortgage Products",
        scenario: "Grace owns her home worth £265,000 with a £95,000 residential mortgage remaining. She wants to buy a new main residence for £310,000. Instead of selling, she plans to let out her current property for £1,150 per month and convert her residential mortgage to a buy-to-let mortgage. She has £40,000 saved for her new purchase deposit.",
        scenarioId: "scenario-27",
        question: "What will be the LTV on Grace's current property when converted to buy-to-let?",
        optionA: "32.8%",
        optionB: "35.8%",
        optionC: "38.8%",
        optionD: "41.8%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Grace owns her home worth £265,000 with a £95,000 residential mortgage remaining. She wants to buy a new main residence for £310,000. Instead of selling, she plans to let out her current property for £1,150 per month and convert her residential mortgage to a buy-to-let mortgage. She has £40,000 saved for her new purchase deposit.",
        scenarioId: "scenario-27",
        question: "At a stressed rate of 5.5%, the £95,000 mortgage payment would be £525/month. Does the £1,150 rental income meet a 125% interest coverage ratio?",
        optionA: "No, she needs £656.25",
        optionB: "Yes, comfortably exceeds the requirement",
        optionC: "No, she needs £1,250",
        optionD: "Exactly meets the requirement",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Grace owns her home worth £265,000 with a £95,000 residential mortgage remaining. She wants to buy a new main residence for £310,000. Instead of selling, she plans to let out her current property for £1,150 per month and convert her residential mortgage to a buy-to-let mortgage. She has £40,000 saved for her new purchase deposit.",
        scenarioId: "scenario-27",
        question: "Will Grace pay the 3% SDLT surcharge when purchasing her new £310,000 main residence?",
        optionA: "No, it's her main residence",
        optionB: "Yes, because she owns another residential property",
        optionC: "No, if she sells within 3 years she can claim a refund",
        optionD: "Both B and C are correct",
        answer: "D"
      },

      // Scenario 28: Holiday Let Mortgage
      {
        topic: "Mortgage Products",
        scenario: "Ben is purchasing a coastal cottage for £245,000 to operate as a holiday let. The property can be let for approximately 20 weeks per year at £850 per week, generating £17,000 annual income. Ben has a £75,000 deposit and earns £38,000 from employment. Holiday let mortgages typically require 25-30% deposit.",
        scenarioId: "scenario-28",
        question: "What LTV will Ben's holiday let mortgage be?",
        optionA: "65.4%",
        optionB: "69.4%",
        optionC: "73.4%",
        optionD: "77.4%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Ben is purchasing a coastal cottage for £245,000 to operate as a holiday let. The property can be let for approximately 20 weeks per year at £850 per week, generating £17,000 annual income. Ben has a £75,000 deposit and earns £38,000 from employment. Holiday let mortgages typically require 25-30% deposit.",
        scenarioId: "scenario-28",
        question: "What is a key tax advantage of Furnished Holiday Lets (FHL) over standard buy-to-let?",
        optionA: "No income tax on rental profits",
        optionB: "Capital allowances on furniture and equipment, and potential business asset rollover relief",
        optionC: "No capital gains tax when sold",
        optionD: "Double the personal allowance",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Ben is purchasing a coastal cottage for £245,000 to operate as a holiday let. The property can be let for approximately 20 weeks per year at £850 per week, generating £17,000 annual income. Ben has a £75,000 deposit and earns £38,000 from employment. Holiday let mortgages typically require 25-30% deposit.",
        scenarioId: "scenario-28",
        question: "To qualify as a Furnished Holiday Let for tax purposes, the property must be available for letting for at least:",
        optionA: "70 days per year",
        optionB: "140 days per year",
        optionC: "210 days per year",
        optionD: "280 days per year",
        answer: "C"
      },

      // Scenario 29: HMO (House in Multiple Occupation) Purchase
      {
        topic: "Mortgage Products",
        scenario: "Priya is buying a 6-bedroom property for £340,000 to convert into an HMO (House in Multiple Occupation). Each room can be let for £450/month (£2,700 total). HMO mortgages typically require 25% deposit minimum and assess rental income at 145% coverage at a stressed rate of 6.5%. Priya has £90,000 deposit.",
        scenarioId: "scenario-29",
        question: "What LTV will Priya's HMO mortgage be?",
        optionA: "71.5%",
        optionB: "73.5%",
        optionC: "75.5%",
        optionD: "77.5%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Priya is buying a 6-bedroom property for £340,000 to convert into an HMO (House in Multiple Occupation). Each room can be let for £450/month (£2,700 total). HMO mortgages typically require 25% deposit minimum and assess rental income at 145% coverage at a stressed rate of 6.5%. Priya has £90,000 deposit.",
        scenarioId: "scenario-29",
        question: "At 6.5% stressed rate, the £250,000 mortgage payment would be £1,354/month. What minimum rental income is needed for 145% coverage?",
        optionA: "£1,687",
        optionB: "£1,854",
        optionC: "£1,963",
        optionD: "£2,125",
        answer: "C"
      },
      {
        topic: "Mortgage Law",
        scenario: "Priya is buying a 6-bedroom property for £340,000 to convert into an HMO (House in Multiple Occupation). Each room can be let for £450/month (£2,700 total). HMO mortgages typically require 25% deposit minimum and assess rental income at 145% coverage at a stressed rate of 6.5%. Priya has £90,000 deposit.",
        scenarioId: "scenario-29",
        question: "What additional legal requirement applies to HMOs with 5+ tenants from 2+ households?",
        optionA: "No additional requirements",
        optionB: "Mandatory HMO license from local authority",
        optionC: "Must be managed by a letting agent",
        optionD: "Cannot charge more than £400 per room",
        answer: "B"
      },

      // Scenario 30: Non-Standard Construction
      {
        topic: "Mortgage Products",
        scenario: "Daniel wants to purchase a timber-framed cottage for £210,000. The property survey reveals it's of non-standard construction with a thatched roof. Daniel has a £42,000 deposit (20%) and earns £39,000 per year. Many mainstream lenders won't lend on non-standard construction or thatched properties.",
        scenarioId: "scenario-30",
        question: "What LTV is Daniel's mortgage?",
        optionA: "75%",
        optionB: "80%",
        optionC: "85%",
        optionD: "90%",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Daniel wants to purchase a timber-framed cottage for £210,000. The property survey reveals it's of non-standard construction with a thatched roof. Daniel has a £42,000 deposit (20%) and earns £39,000 per year. Many mainstream lenders won't lend on non-standard construction or thatched properties.",
        scenarioId: "scenario-30",
        question: "What challenge will Daniel face getting a mortgage on this property?",
        optionA: "No lenders will lend at all",
        optionB: "Limited lender choice, potentially higher rates, and stricter survey requirements",
        optionC: "He needs 50% deposit minimum",
        optionD: "Thatched properties are illegal",
        answer: "B"
      },
      {
        topic: "Protection Products",
        scenario: "Daniel wants to purchase a timber-framed cottage for £210,000. The property survey reveals it's of non-standard construction with a thatched roof. Daniel has a £42,000 deposit (20%) and earns £39,000 per year. Many mainstream lenders won't lend on non-standard construction or thatched properties.",
        scenarioId: "scenario-30",
        question: "What insurance consideration is especially important for thatched properties?",
        optionA: "Life insurance only",
        optionB: "Specialist buildings insurance due to higher fire risk and rebuilding costs",
        optionC: "No insurance is required",
        optionD: "Standard buildings insurance is fine",
        answer: "B"
      },

      // Scenario 31: Auction Purchase with Bridging
      {
        topic: "Mortgage Products",
        scenario: "Karim successfully bid £155,000 for a property at auction that needs modernization (current value £130,000, post-renovation value £195,000). Auction purchases must complete within 28 days. Karim will use a bridging loan at 0.85% per month, then refinance to a standard mortgage after 4 months of renovations (costing £25,000).",
        scenarioId: "scenario-31",
        question: "How much interest will Karim pay on a £155,000 bridging loan for 4 months at 0.85% per month?",
        optionA: "£4,845",
        optionB: "£5,270",
        optionC: "£5,695",
        optionD: "£6,120",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Karim successfully bid £155,000 for a property at auction that needs modernization (current value £130,000, post-renovation value £195,000). Auction purchases must complete within 28 days. Karim will use a bridging loan at 0.85% per month, then refinance to a standard mortgage after 4 months of renovations (costing £25,000).",
        scenarioId: "scenario-31",
        question: "What is Karim's total investment including purchase, bridging interest, and renovations?",
        optionA: "£180,270",
        optionB: "£185,270",
        optionC: "£190,270",
        optionD: "£195,270",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Karim successfully bid £155,000 for a property at auction that needs modernization (current value £130,000, post-renovation value £195,000). Auction purchases must complete within 28 days. Karim will use a bridging loan at 0.85% per month, then refinance to a standard mortgage after 4 months of renovations (costing £25,000).",
        scenarioId: "scenario-31",
        question: "If Karim refinances to a 75% LTV mortgage after renovation (property worth £195,000), how much can he borrow?",
        optionA: "£136,250",
        optionB: "£146,250",
        optionC: "£156,250",
        optionD: "£166,250",
        answer: "B"
      },

      // Scenario 32: Early Repayment Charges (ERC)
      {
        topic: "Mortgage Products",
        scenario: "Zoe has a £180,000 mortgage on a 5-year fixed rate at 3.8% with 2 years remaining. She wants to remortgage to a new 2-year fix at 4.2% to release £30,000 equity for home improvements. Her current lender's ERC is 3% of the outstanding balance for years 4-5.",
        scenarioId: "scenario-32",
        question: "How much will Zoe's early repayment charge be if she remortgages now?",
        optionA: "£4,800",
        optionB: "£5,400",
        optionC: "£6,000",
        optionD: "£6,600",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Zoe has a £180,000 mortgage on a 5-year fixed rate at 3.8% with 2 years remaining. She wants to remortgage to a new 2-year fix at 4.2% to release £30,000 equity for home improvements. Her current lender's ERC is 3% of the outstanding balance for years 4-5.",
        scenarioId: "scenario-32",
        question: "What alternative should you discuss with Zoe to avoid the ERC?",
        optionA: "Never remortgage",
        optionB: "Wait 2 years until the fixed term ends, or use a second charge mortgage, or check annual overpayment allowance",
        optionC: "Sell the property",
        optionD: "Declare bankruptcy",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Zoe has a £180,000 mortgage on a 5-year fixed rate at 3.8% with 2 years remaining. She wants to remortgage to a new 2-year fix at 4.2% to release £30,000 equity for home improvements. Her current lender's ERC is 3% of the outstanding balance for years 4-5.",
        scenarioId: "scenario-32",
        question: "What is a typical annual overpayment allowance without penalty on fixed-rate mortgages?",
        optionA: "5% of the outstanding balance per year",
        optionB: "10% of the outstanding balance per year",
        optionC: "15% of the outstanding balance per year",
        optionD: "20% of the outstanding balance per year",
        answer: "B"
      },

      // Scenario 33: Porting a Mortgage
      {
        topic: "Mortgage Products",
        scenario: "Hassan is selling his property for £265,000 (mortgage balance £140,000) and buying a new home for £315,000. He has 18 months left on a 5-year fix at 2.9% (product ERC 2%). Hassan wants to port his mortgage and borrow an additional £75,000 for the new property. His lender allows porting with additional borrowing.",
        scenarioId: "scenario-33",
        question: "How much additional borrowing does Hassan need beyond his existing £140,000 mortgage?",
        optionA: "£50,000",
        optionB: "£75,000",
        optionC: "£100,000",
        optionD: "£125,000",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Hassan is selling his property for £265,000 (mortgage balance £140,000) and buying a new home for £315,000. He has 18 months left on a 5-year fix at 2.9% (product ERC 2%). Hassan wants to port his mortgage and borrow an additional £75,000 for the new property. His lender allows porting with additional borrowing.",
        scenarioId: "scenario-33",
        question: "How will the interest rates work on Hassan's ported mortgage?",
        optionA: "2.9% on the entire £215,000",
        optionB: "2.9% on the existing £140,000, and a new rate (likely higher) on the additional £75,000",
        optionC: "A completely new rate on everything",
        optionD: "5.8% on everything (double the rate)",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Hassan is selling his property for £265,000 (mortgage balance £140,000) and buying a new home for £315,000. He has 18 months left on a 5-year fix at 2.9% (product ERC 2%). Hassan wants to port his mortgage and borrow an additional £75,000 for the new property. His lender allows porting with additional borrowing.",
        scenarioId: "scenario-33",
        question: "What ERC will Hassan avoid by porting his mortgage instead of remortgaging to a new lender?",
        optionA: "£1,500",
        optionB: "£2,100",
        optionC: "£2,800",
        optionD: "£3,500",
        answer: "C"
      },

      // Scenario 34: Payment Holiday Impact
      {
        topic: "Mortgage Products",
        scenario: "During financial difficulty, Amelia took a 3-month payment holiday on her £195,000 repayment mortgage at 4.5% over 20 years. The missed payments (£1,230 × 3 = £3,690) were added to the mortgage balance. Amelia has now resumed normal payments but the term wasn't extended.",
        scenarioId: "scenario-34",
        question: "What is Amelia's new mortgage balance after the payment holiday?",
        optionA: "£195,000 (unchanged)",
        optionB: "£198,690",
        optionC: "£201,690",
        optionD: "£205,690",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "During financial difficulty, Amelia took a 3-month payment holiday on her £195,000 repayment mortgage at 4.5% over 20 years. The missed payments (£1,230 × 3 = £3,690) were added to the mortgage balance. Amelia has now resumed normal payments but the term wasn't extended.",
        scenarioId: "scenario-34",
        question: "How does the payment holiday affect Amelia's mortgage?",
        optionA: "No impact at all",
        optionB: "Interest continues to accrue on the balance, increasing the total amount owed and overall cost",
        optionC: "The term automatically extends by 3 months",
        optionD: "Future interest is waived",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "During financial difficulty, Amelia took a 3-month payment holiday on her £195,000 repayment mortgage at 4.5% over 20 years. The missed payments (£1,230 × 3 = £3,690) were added to the mortgage balance. Amelia has now resumed normal payments but the term wasn't extended.",
        scenarioId: "scenario-34",
        question: "Will the payment holiday appear on Amelia's credit file?",
        optionA: "No, payment holidays are never reported",
        optionB: "Yes, it may be recorded and could affect future credit applications",
        optionC: "Only if she takes more than one",
        optionD: "Only for 6 months then removed",
        answer: "B"
      },

      // Scenario 35: Mortgage Prisoner
      {
        topic: "Mortgage Products",
        scenario: "Joanne has a £165,000 mortgage on a variable rate of 6.2% (SVR) with an inactive lender who no longer offers new products. Her property is worth £225,000 and she earns £36,000. She cannot remortgage because her current affordability doesn't meet new lending criteria, even though she can afford her current payments. She's been on SVR for 4 years.",
        scenarioId: "scenario-35",
        question: "What LTV is Joanne's current mortgage?",
        optionA: "68.9%",
        optionB: "71.3%",
        optionC: "73.3%",
        optionD: "76.7%",
        answer: "C"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Joanne has a £165,000 mortgage on a variable rate of 6.2% (SVR) with an inactive lender who no longer offers new products. Her property is worth £225,000 and she earns £36,000. She cannot remortgage because her current affordability doesn't meet new lending criteria, even though she can afford her current payments. She's been on SVR for 4 years.",
        scenarioId: "scenario-35",
        question: "What defines a 'mortgage prisoner' like Joanne?",
        optionA: "Someone who doesn't pay their mortgage",
        optionB: "Someone trapped with an inactive lender on uncompetitive rates, unable to switch due to regulatory changes or affordability rules",
        optionC: "Someone with multiple mortgages",
        optionD: "Someone in negative equity",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Joanne has a £165,000 mortgage on a variable rate of 6.2% (SVR) with an inactive lender who no longer offers new products. Her property is worth £225,000 and she earns £36,000. She cannot remortgage because her current affordability doesn't meet new lending criteria, even though she can afford her current payments. She's been on SVR for 4 years.",
        scenarioId: "scenario-35",
        question: "What FCA rule change in 2019 aimed to help mortgage prisoners?",
        optionA: "Banned all variable rates",
        optionB: "Modified affordability rules allowing prisoners to switch to another lender's SVR without full affordability checks",
        optionC: "Forced all lenders to offer 2% rates",
        optionD: "Eliminated all mortgages over 20 years old",
        answer: "B"
      },

      // Scenario 36: Shared Equity Scheme
      {
        topic: "Mortgage Products",
        scenario: "Tyler is purchasing through a shared equity scheme where a housing association provides 25% equity (£56,250) for a £225,000 new-build. Tyler provides a 5% deposit (£11,250) and needs a mortgage for the remaining 70% (£157,500). Tyler earns £29,000 per year. The housing association charges no rent on their equity share for the first 5 years.",
        scenarioId: "scenario-36",
        question: "What LTV is Tyler's mortgage based on the full property value?",
        optionA: "65%",
        optionB: "70%",
        optionC: "75%",
        optionD: "80%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Tyler is purchasing through a shared equity scheme where a housing association provides 25% equity (£56,250) for a £225,000 new-build. Tyler provides a 5% deposit (£11,250) and needs a mortgage for the remaining 70% (£157,500). Tyler earns £29,000 per year. The housing association charges no rent on their equity share for the first 5 years.",
        scenarioId: "scenario-36",
        question: "Using a 4.5 income multiple, can Tyler afford the £157,500 mortgage on his salary?",
        optionA: "No, he can only borrow £108,000",
        optionB: "No, he can only borrow £130,500",
        optionC: "Yes, he can borrow exactly £157,500",
        optionD: "Yes, he can borrow up to £174,000",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        scenario: "Tyler is purchasing through a shared equity scheme where a housing association provides 25% equity (£56,250) for a £225,000 new-build. Tyler provides a 5% deposit (£11,250) and needs a mortgage for the remaining 70% (£157,500). Tyler earns £29,000 per year. The housing association charges no rent on their equity share for the first 5 years.",
        scenarioId: "scenario-36",
        question: "When Tyler sells the property, how much must he repay to the housing association?",
        optionA: "Exactly £56,250",
        optionB: "25% of the property's value at time of sale",
        optionC: "£56,250 plus interest",
        optionD: "Nothing, it's a grant",
        answer: "B"
      },

      // Scenario 37: Overseas Buyer (Expat)
      {
        topic: "Mortgage Products",
        scenario: "Amir works in Dubai earning £72,000 per year (AED 340,000) but wants to purchase a UK buy-to-let property for £280,000 to generate £1,300 monthly rent. He has £70,000 deposit. As an expat, lenders typically require higher deposits (25-40%) and may apply currency exchange risk adjustments to income.",
        scenarioId: "scenario-37",
        question: "What LTV will Amir's expat mortgage be?",
        optionA: "70%",
        optionB: "75%",
        optionC: "80%",
        optionD: "85%",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Amir works in Dubai earning £72,000 per year (AED 340,000) but wants to purchase a UK buy-to-let property for £280,000 to generate £1,300 monthly rent. He has £70,000 deposit. As an expat, lenders typically require higher deposits (25-40%) and may apply currency exchange risk adjustments to income.",
        scenarioId: "scenario-37",
        question: "What additional challenge do expat borrowers face?",
        optionA: "They cannot buy UK property",
        optionB: "Limited lender choice, higher deposit requirements, and currency exchange risk considerations",
        optionC: "They pay double stamp duty",
        optionD: "They can only buy commercial property",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Amir works in Dubai earning £72,000 per year (AED 340,000) but wants to purchase a UK buy-to-let property for £280,000 to generate £1,300 monthly rent. He has £70,000 deposit. As an expat, lenders typically require higher deposits (25-40%) and may apply currency exchange risk adjustments to income.",
        scenarioId: "scenario-37",
        question: "As a non-UK resident, what additional tax consideration applies to Amir's rental income?",
        optionA: "No UK tax applies",
        optionB: "20% withholding tax on gross rents unless he registers for Non-Resident Landlord scheme",
        optionC: "Double taxation with no relief",
        optionD: "Flat 50% tax rate",
        answer: "B"
      },

      // Scenario 38: Limited Company Buy-to-Let
      {
        topic: "Mortgage Products",
        scenario: "Sarah is a higher-rate taxpayer considering purchasing a buy-to-let property for £295,000 through a limited company rather than personally. The property would rent for £1,400/month. She has £74,000 to invest. SPV (Special Purpose Vehicle) mortgages typically have slightly higher rates but offer tax advantages for higher-rate taxpayers.",
        scenarioId: "scenario-38",
        question: "What LTV will the limited company mortgage be?",
        optionA: "71.9%",
        optionB: "74.9%",
        optionC: "77.9%",
        optionD: "80.9%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "Sarah is a higher-rate taxpayer considering purchasing a buy-to-let property for £295,000 through a limited company rather than personally. The property would rent for £1,400/month. She has £74,000 to invest. SPV (Special Purpose Vehicle) mortgages typically have slightly higher rates but offer tax advantages for higher-rate taxpayers.",
        scenarioId: "scenario-38",
        question: "What is the key tax advantage of buying through a limited company for higher-rate taxpayers?",
        optionA: "No tax is paid at all",
        optionB: "Mortgage interest is fully deductible as a business expense, and profits taxed at corporation tax rate (currently 19-25%)",
        optionC: "Double the personal allowance",
        optionD: "No stamp duty",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Sarah is a higher-rate taxpayer considering purchasing a buy-to-let property for £295,000 through a limited company rather than personally. The property would rent for £1,400/month. She has £74,000 to invest. SPV (Special Purpose Vehicle) mortgages typically have slightly higher rates but offer tax advantages for higher-rate taxpayers.",
        scenarioId: "scenario-38",
        question: "What is a disadvantage of holding property in a limited company?",
        optionA: "No disadvantages exist",
        optionB: "Additional costs (company formation, accounting, Corporation Tax returns) and extracting profits may incur income tax/dividend tax",
        optionC: "Cannot remortgage ever",
        optionD: "The property cannot be sold",
        answer: "B"
      },

      // Scenario 39: Agricultural Property Purchase
      {
        topic: "Mortgage Products",
        scenario: "James is purchasing a 5-acre smallholding with a farmhouse for £425,000. The property includes 3 acres of grazing land and outbuildings. James plans to keep livestock as a hobby alongside his £52,000 employment income. He has £125,000 deposit. Agricultural mortgages have different criteria than residential mortgages.",
        scenarioId: "scenario-39",
        question: "What LTV will James's agricultural mortgage be?",
        optionA: "66.5%",
        optionB: "70.6%",
        optionC: "74.8%",
        optionD: "78.9%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "James is purchasing a 5-acre smallholding with a farmhouse for £425,000. The property includes 3 acres of grazing land and outbuildings. James plans to keep livestock as a hobby alongside his £52,000 employment income. He has £125,000 deposit. Agricultural mortgages have different criteria than residential mortgages.",
        scenarioId: "scenario-39",
        question: "How do agricultural mortgage lenders typically assess affordability differently?",
        optionA: "Only using agricultural income",
        optionB: "They consider both employment income and potential agricultural income/land value",
        optionC: "They don't assess affordability",
        optionD: "Only for professional farmers",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "James is purchasing a 5-acre smallholding with a farmhouse for £425,000. The property includes 3 acres of grazing land and outbuildings. James plans to keep livestock as a hobby alongside his £52,000 employment income. He has £125,000 deposit. Agricultural mortgages have different criteria than residential mortgages.",
        scenarioId: "scenario-39",
        question: "What potential IHT relief might apply to genuine agricultural property?",
        optionA: "No relief available",
        optionB: "Agricultural Property Relief at 50% or 100% depending on occupation",
        optionC: "Standard residential nil-rate band only",
        optionD: "Automatic 100% exemption for all farms",
        answer: "B"
      },

      // Scenario 40: Retirement Village Purchase
      {
        topic: "Mortgage Products",
        scenario: "Barbara, aged 71, wants to purchase a retirement apartment for £185,000 in an age-restricted development (55+). She receives £24,000 annual pension income and has £55,000 in savings for deposit. The development charges £320 monthly service charge. Most standard lenders have upper age limits, but specialist later-life lending is available.",
        scenarioId: "scenario-40",
        question: "What LTV mortgage does Barbara need?",
        optionA: "65.3%",
        optionB: "70.3%",
        optionC: "75.3%",
        optionD: "80.3%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Barbara, aged 71, wants to purchase a retirement apartment for £185,000 in an age-restricted development (55+). She receives £24,000 annual pension income and has £55,000 in savings for deposit. The development charges £320 monthly service charge. Most standard lenders have upper age limits, but specialist later-life lending is available.",
        scenarioId: "scenario-40",
        question: "What is a common maximum age limit for standard residential mortgages at end of term?",
        optionA: "70 years",
        optionB: "75 years",
        optionC: "80-85 years (varies by lender)",
        optionD: "No age limit",
        answer: "C"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Barbara, aged 71, wants to purchase a retirement apartment for £185,000 in an age-restricted development (55+). She receives £24,000 annual pension income and has £55,000 in savings for deposit. The development charges £320 monthly service charge. Most standard lenders have upper age limits, but specialist later-life lending is available.",
        scenarioId: "scenario-40",
        question: "What should you warn Barbara about regarding retirement developments?",
        optionA: "They always increase in value",
        optionB: "They may be harder to sell due to age restrictions and service charges, potentially affecting resale value",
        optionC: "She can never move out",
        optionD: "No warnings needed",
        answer: "B"
      },

      // Scenario 41: Probate Property Purchase
      {
        topic: "Mortgage Law",
        scenario: "The Taylor siblings (3 of them) inherited a property worth £310,000 from their late mother. There's an outstanding mortgage of £45,000. They want to keep the property as a buy-to-let generating £1,250/month rent. They need to obtain probate and decide whether to keep the existing mortgage or remortgage. Each sibling will own 1/3 share.",
        scenarioId: "scenario-41",
        question: "What is the current LTV on the inherited property?",
        optionA: "12.5%",
        optionB: "14.5%",
        optionC: "16.5%",
        optionD: "18.5%",
        answer: "B"
      },
      {
        topic: "UK Taxation",
        scenario: "The Taylor siblings (3 of them) inherited a property worth £310,000 from their late mother. There's an outstanding mortgage of £45,000. They want to keep the property as a buy-to-let generating £1,250/month rent. They need to obtain probate and decide whether to keep the existing mortgage or remortgage. Each sibling will own 1/3 share.",
        scenarioId: "scenario-41",
        question: "If the estate exceeded the nil-rate band and IHT was due, on what value would IHT be calculated for this property?",
        optionA: "£310,000 (full value)",
        optionB: "£265,000 (value minus mortgage)",
        optionC: "£103,333 (each sibling's share)",
        optionD: "No IHT on inherited property",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "The Taylor siblings (3 of them) inherited a property worth £310,000 from their late mother. There's an outstanding mortgage of £45,000. They want to keep the property as a buy-to-let generating £1,250/month rent. They need to obtain probate and decide whether to keep the existing mortgage or remortgage. Each sibling will own 1/3 share.",
        scenarioId: "scenario-41",
        question: "If they remortgage to a buy-to-let mortgage, what type of ownership should they consider?",
        optionA: "Each gets their own separate mortgage",
        optionB: "Joint borrowers as 'joint tenants' or 'tenants in common' - with all liable for the full debt",
        optionC: "Only one sibling can be on the mortgage",
        optionD: "The lender owns everything",
        answer: "B"
      },

      // Scenario 42: Equity Release for Home Improvements
      {
        topic: "Mortgage Products",
        scenario: "Colin and Jean, both 68, own their £395,000 home outright. They want to raise £65,000 for significant home improvements (wet room, stairlift, new heating). They're considering a lifetime mortgage drawdown plan where they initially borrow £40,000 at 5.8% with £25,000 available as a reserve facility for future use.",
        scenarioId: "scenario-42",
        question: "What is the LTV of the initial £40,000 drawdown?",
        optionA: "8.1%",
        optionB: "10.1%",
        optionC: "12.1%",
        optionD: "14.1%",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Colin and Jean, both 68, own their £395,000 home outright. They want to raise £65,000 for significant home improvements (wet room, stairlift, new heating). They're considering a lifetime mortgage drawdown plan where they initially borrow £40,000 at 5.8% with £25,000 available as a reserve facility for future use.",
        scenarioId: "scenario-42",
        question: "What is the advantage of a drawdown facility over borrowing the full £65,000 upfront?",
        optionA: "Lower interest rate",
        optionB: "Interest only charged on amounts drawn, reducing overall interest costs",
        optionC: "No interest is ever charged",
        optionD: "The reserve facility is free money",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Colin and Jean, both 68, own their £395,000 home outright. They want to raise £65,000 for significant home improvements (wet room, stairlift, new heating). They're considering a lifetime mortgage drawdown plan where they initially borrow £40,000 at 5.8% with £25,000 available as a reserve facility for future use.",
        scenarioId: "scenario-42",
        question: "Why must Colin and Jean receive advice from an equity release specialist advisor?",
        optionA: "It's optional",
        optionB: "FCA regulation requires specialist qualification (CeMAP 3 plus Certificate in Equity Release) to advise on equity release products",
        optionC: "To sell more expensive products",
        optionD: "Only for people over 70",
        answer: "B"
      },

      // Scenario 43: Stamp Duty Land Tax Calculation
      {
        topic: "UK Taxation",
        scenario: "Emma is purchasing her first home in England for £425,000. As a first-time buyer, she benefits from first-time buyer relief on properties up to £625,000 (no SDLT on first £425,000 for FTB). Her friend John is buying a £425,000 second home and will pay the standard rates plus 3% surcharge.",
        scenarioId: "scenario-43",
        question: "How much SDLT will Emma pay as a first-time buyer?",
        optionA: "£0",
        optionB: "£6,250",
        optionC: "£11,250",
        optionD: "£21,250",
        answer: "A"
      },
      {
        topic: "UK Taxation",
        scenario: "Emma is purchasing her first home in England for £425,000. As a first-time buyer, she benefits from first-time buyer relief on properties up to £625,000 (no SDLT on first £425,000 for FTB). Her friend John is buying a £425,000 second home and will pay the standard rates plus 3% surcharge.",
        scenarioId: "scenario-43",
        question: "How much SDLT will John pay on his £425,000 second home purchase (including 3% surcharge)?",
        optionA: "£21,250",
        optionB: "£24,000",
        optionC: "£27,750",
        optionD: "£33,500",
        answer: "D"
      },
      {
        topic: "UK Taxation",
        scenario: "Emma is purchasing her first home in England for £425,000. As a first-time buyer, she benefits from first-time buyer relief on properties up to £625,000 (no SDLT on first £425,000 for FTB). Her friend John is buying a £425,000 second home and will pay the standard rates plus 3% surcharge.",
        scenarioId: "scenario-43",
        question: "What is the SDLT savings Emma makes compared to John by being a first-time buyer?",
        optionA: "£21,250",
        optionB: "£27,750",
        optionC: "£33,500",
        optionD: "£42,500",
        answer: "C"
      },

      // Scenario 44: Buildings and Contents Insurance
      {
        topic: "Protection Products",
        scenario: "Liam has purchased a £280,000 property with a £245,000 mortgage (£35,000 deposit). The rebuild cost is estimated at £195,000. His lender requires buildings insurance as a condition of the mortgage. Liam also has £28,000 of contents (furniture, electronics, valuables). Buildings insurance quote: £285/year, Contents insurance quote: £145/year.",
        scenarioId: "scenario-44",
        question: "What sum should Liam insure the buildings for?",
        optionA: "£245,000 (mortgage amount)",
        optionB: "£195,000 (rebuild cost)",
        optionC: "£280,000 (purchase price)",
        optionD: "£308,000 (purchase price plus 10%)",
        answer: "B"
      },
      {
        topic: "Protection Products",
        scenario: "Liam has purchased a £280,000 property with a £245,000 mortgage (£35,000 deposit). The rebuild cost is estimated at £195,000. His lender requires buildings insurance as a condition of the mortgage. Liam also has £28,000 of contents (furniture, electronics, valuables). Buildings insurance quote: £285/year, Contents insurance quote: £145/year.",
        scenarioId: "scenario-44",
        question: "Is contents insurance mandatory for Liam's mortgage?",
        optionA: "Yes, both buildings and contents are mandatory",
        optionB: "No, only buildings insurance is mandatory for the mortgage (but contents insurance is highly recommended)",
        optionC: "No insurance is required",
        optionD: "Only life insurance is required",
        answer: "B"
      },
      {
        topic: "Protection Products",
        scenario: "Liam has purchased a £280,000 property with a £245,000 mortgage (£35,000 deposit). The rebuild cost is estimated at £195,000. His lender requires buildings insurance as a condition of the mortgage. Liam also has £28,000 of contents (furniture, electronics, valuables). Buildings insurance quote: £285/year, Contents insurance quote: £145/year.",
        scenarioId: "scenario-44",
        question: "What are Liam's total annual insurance costs if he takes both policies?",
        optionA: "£285",
        optionB: "£360",
        optionC: "£430",
        optionD: "£520",
        answer: "C"
      },

      // Scenario 45: Age Gap Joint Mortgage
      {
        topic: "Financial Advice Process",
        scenario: "Isabella (28) and Marcus (52) want to buy a property together for £295,000. Isabella earns £32,000 and Marcus earns £56,000 (£88,000 combined). They have £45,000 deposit. Many lenders use the older applicant's age to determine maximum term. Marcus would reach standard retirement age (67) in 15 years.",
        scenarioId: "scenario-45",
        question: "Using a 4.5 income multiple on their combined income, what is the maximum they can borrow?",
        optionA: "£352,000",
        optionB: "£376,000",
        optionC: "£396,000",
        optionD: "£416,000",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Isabella (28) and Marcus (52) want to buy a property together for £295,000. Isabella earns £32,000 and Marcus earns £56,000 (£88,000 combined). They have £45,000 deposit. Many lenders use the older applicant's age to determine maximum term. Marcus would reach standard retirement age (67) in 15 years.",
        scenarioId: "scenario-45",
        question: "If a lender limits the term to when Marcus reaches 67, what maximum mortgage term might they offer?",
        optionA: "10 years",
        optionB: "15 years",
        optionC: "20 years",
        optionD: "25 years",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Isabella (28) and Marcus (52) want to buy a property together for £295,000. Isabella earns £32,000 and Marcus earns £56,000 (£88,000 combined). They have £45,000 deposit. Many lenders use the older applicant's age to determine maximum term. Marcus would reach standard retirement age (67) in 15 years.",
        scenarioId: "scenario-45",
        question: "What solution could help Isabella and Marcus obtain a longer mortgage term?",
        optionA: "Give up and rent forever",
        optionB: "Choose a lender with more flexible age criteria or who assesses retirement income, or consider term ending at 70-75",
        optionC: "Only use Marcus's income",
        optionD: "Buy a cheaper property",
        answer: "B"
      },

      // Scenario 46: Contractor/Temp Worker Income
      {
        topic: "Financial Advice Process",
        scenario: "Rachel works as an IT contractor through her own limited company. Her day rate is £450, and she typically works 220 days per year (gross £99,000). She pays herself a £12,570 salary and £35,000 in dividends, retaining profits in the company. Rachel wants to purchase a £265,000 property with £40,000 deposit. Lenders assess contractor income differently.",
        scenarioId: "scenario-46",
        question: "Using only her salary and dividends (£47,570), can Rachel borrow £225,000 using a 4.5 multiple?",
        optionA: "Yes, easily - she can borrow £214,065",
        optionB: "No, she can only borrow £189,000",
        optionC: "No, she can only borrow £56,565",
        optionD: "Yes, she can borrow £270,000",
        answer: "A"
      },
      {
        topic: "Mortgage Products",
        scenario: "Rachel works as an IT contractor through her own limited company. Her day rate is £450, and she typically works 220 days per year (gross £99,000). She pays herself a £12,570 salary and £35,000 in dividends, retaining profits in the company. Rachel wants to purchase a £265,000 property with £40,000 deposit. Lenders assess contractor income differently.",
        scenarioId: "scenario-46",
        question: "How might specialist contractor lenders assess Rachel's income differently?",
        optionA: "They don't lend to contractors",
        optionB: "They may use day rate × working days or gross contract value, potentially allowing higher borrowing",
        optionC: "They only use salary, ignoring dividends",
        optionD: "They require 50% deposit from contractors",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Rachel works as an IT contractor through her own limited company. Her day rate is £450, and she typically works 220 days per year (gross £99,000). She pays herself a £12,570 salary and £35,000 in dividends, retaining profits in the company. Rachel wants to purchase a £265,000 property with £40,000 deposit. Lenders assess contractor income differently.",
        scenarioId: "scenario-46",
        question: "What documentation will lenders typically require from Rachel as a contractor?",
        optionA: "Just a payslip",
        optionB: "Latest contract, company accounts, SA302, potentially 2 years' history, bank statements",
        optionC: "Nothing special",
        optionD: "Only a passport",
        answer: "B"
      },

      // Scenario 47: Auction Purchase Completion Timeline
      {
        topic: "Mortgage Law",
        scenario: "Scott successfully bid £168,000 at auction for a repossessed property (market value £185,000 after refurbishment). He paid a 10% deposit (£16,800) at auction and must complete within 28 days or lose his deposit. Scott needs a £151,200 mortgage but standard mortgages take 4-8 weeks. The property needs £12,000 of work before it's mortgageable.",
        scenarioId: "scenario-47",
        question: "What initial payment did Scott make at the auction?",
        optionA: "£8,400",
        optionB: "£12,600",
        optionC: "£16,800",
        optionD: "£21,000",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "Scott successfully bid £168,000 at auction for a repossessed property (market value £185,000 after refurbishment). He paid a 10% deposit (£16,800) at auction and must complete within 28 days or lose his deposit. Scott needs a £151,200 mortgage but standard mortgages take 4-8 weeks. The property needs £12,000 of work before it's mortgageable.",
        scenarioId: "scenario-47",
        question: "What type of finance must Scott use to meet the 28-day completion deadline?",
        optionA: "Standard residential mortgage",
        optionB: "Bridging finance to complete quickly, then refurbish and refinance to standard mortgage",
        optionC: "Personal loan",
        optionD: "Credit card",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Scott successfully bid £168,000 at auction for a repossessed property (market value £185,000 after refurbishment). He paid a 10% deposit (£16,800) at auction and must complete within 28 days or lose his deposit. Scott needs a £151,200 mortgage but standard mortgages take 4-8 weeks. The property needs £12,000 of work before it's mortgageable.",
        scenarioId: "scenario-47",
        question: "What happens if Scott cannot complete within 28 days?",
        optionA: "Nothing, the deadline is flexible",
        optionB: "He loses the £16,800 deposit and the property is re-auctioned",
        optionC: "He gets a full refund",
        optionD: "The timeline automatically extends",
        answer: "B"
      },

      // Scenario 48: Multiple Adverse Credit Issues
      {
        topic: "Financial Advice Process",
        scenario: "Natalie (33) wants to buy a £210,000 property with £32,000 deposit. She earns £40,000 per year. Her credit history shows: CCJ £850 (satisfied 2 years ago), 3 missed payments on a credit card (6 months ago, now clear), defaulted mobile phone £180 (4 years ago). She's been employed for 18 months in the same role.",
        scenarioId: "scenario-48",
        question: "How much does Natalie need to borrow?",
        optionA: "£168,000",
        optionB: "£178,000",
        optionC: "£188,000",
        optionD: "£198,000",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Natalie (33) wants to buy a £210,000 property with £32,000 deposit. She earns £40,000 per year. Her credit history shows: CCJ £850 (satisfied 2 years ago), 3 missed payments on a credit card (6 months ago, now clear), defaulted mobile phone £180 (4 years ago). She's been employed for 18 months in the same role.",
        scenarioId: "scenario-48",
        question: "Which aspect of Natalie's credit history is most concerning to lenders?",
        optionA: "The 4-year-old mobile phone default",
        optionB: "The recent missed payments (6 months ago)",
        optionC: "The satisfied CCJ from 2 years ago",
        optionD: "All equally concerning",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Natalie (33) wants to buy a £210,000 property with £32,000 deposit. She earns £40,000 per year. Her credit history shows: CCJ £850 (satisfied 2 years ago), 3 missed payments on a credit card (6 months ago, now clear), defaulted mobile phone £180 (4 years ago). She's been employed for 18 months in the same role.",
        scenarioId: "scenario-48",
        question: "What is Natalie's likely path to obtaining a mortgage?",
        optionA: "Standard high-street lender at best rates",
        optionB: "Specialist adverse credit lender with higher rates and potentially lower LTV (e.g. 80-85% max)",
        optionC: "Cannot get a mortgage for 6 years",
        optionD: "Government guaranteed scheme only",
        answer: "B"
      },

      // Scenario 49: Property Chain and Bridging
      {
        topic: "Mortgage Products",
        scenario: "The Wilson family is selling their home for £315,000 (mortgage £115,000) and buying a new home for £445,000. Their buyer has pulled out 2 weeks before completion, but the sellers of their dream home won't wait. A bridging lender offers them a £445,000 loan at 0.75% per month for up to 12 months to secure the new property while they find a new buyer.",
        scenarioId: "scenario-49",
        question: "How much equity do the Wilsons have in their current home?",
        optionA: "£180,000",
        optionB: "£190,000",
        optionC: "£200,000",
        optionD: "£210,000",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        scenario: "The Wilson family is selling their home for £315,000 (mortgage £115,000) and buying a new home for £445,000. Their buyer has pulled out 2 weeks before completion, but the sellers of their dream home won't wait. A bridging lender offers them a £445,000 loan at 0.75% per month for up to 12 months to secure the new property while they find a new buyer.",
        scenarioId: "scenario-49",
        question: "If the Wilsons use the bridging loan for 3 months, how much interest will they pay?",
        optionA: "£9,013",
        optionB: "£10,013",
        optionC: "£11,013",
        optionD: "£12,013",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "The Wilson family is selling their home for £315,000 (mortgage £115,000) and buying a new home for £445,000. Their buyer has pulled out 2 weeks before completion, but the sellers of their dream home won't wait. A bridging lender offers them a £445,000 loan at 0.75% per month for up to 12 months to secure the new property while they find a new buyer.",
        scenarioId: "scenario-49",
        question: "What security will the bridging lender take?",
        optionA: "Only the new property",
        optionB: "Only the existing property",
        optionC: "Both properties (first charge on new, second charge on existing until sold)",
        optionD: "No security required",
        answer: "C"
      },

      // Scenario 50: Complex Income Assessment
      {
        topic: "Financial Advice Process",
        scenario: "Chloe and Dan are buying a £385,000 property. Chloe is employed earning £45,000 basic plus £8,000 annual bonus (guaranteed). Dan is self-employed (2 years trading) with net profits: Year 1: £32,000, Year 2: £38,000. They have £58,000 deposit. Lenders typically use average of last 2 years for self-employed and may cap bonus at 50%.",
        scenarioId: "scenario-50",
        question: "What is Chloe's assessable income for affordability (basic salary plus 50% of bonus)?",
        optionA: "£45,000",
        optionB: "£49,000",
        optionC: "£53,000",
        optionD: "£57,000",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        scenario: "Chloe and Dan are buying a £385,000 property. Chloe is employed earning £45,000 basic plus £8,000 annual bonus (guaranteed). Dan is self-employed (2 years trading) with net profits: Year 1: £32,000, Year 2: £38,000. They have £58,000 deposit. Lenders typically use average of last 2 years for self-employed and may cap bonus at 50%.",
        scenarioId: "scenario-50",
        question: "What is Dan's assessable income (average of last 2 years)?",
        optionA: "£32,000",
        optionB: "£35,000",
        optionC: "£38,000",
        optionD: "£40,000",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        scenario: "Chloe and Dan are buying a £385,000 property. Chloe is employed earning £45,000 basic plus £8,000 annual bonus (guaranteed). Dan is self-employed (2 years trading) with net profits: Year 1: £32,000, Year 2: £38,000. They have £58,000 deposit. Lenders typically use average of last 2 years for self-employed and may cap bonus at 50%.",
        scenarioId: "scenario-50",
        question: "Using their combined assessable income (£84,000) and a 4.5 multiple, can they afford the £327,000 mortgage needed?",
        optionA: "No, they can only borrow £252,000",
        optionB: "No, they can only borrow £315,000",
        optionC: "Yes, they can borrow up to £378,000",
        optionD: "Yes, they can borrow up to £420,000",
        answer: "C"
      },
    ];

    questionBank.forEach((q) => {
      const id = randomUUID();
      const question: Question = { ...q, id };
      this.questions.set(id, question);
    });
  }

  // Shuffle answer positions to prevent pattern recognition
  private shuffleAnswerPositions(question: Question): Question {
    // Create array of options with their original letters
    const options = [
      { letter: 'A', text: question.optionA },
      { letter: 'B', text: question.optionB },
      { letter: 'C', text: question.optionC },
      { letter: 'D', text: question.optionD }
    ];
    
    // Shuffle the options array
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Find which position the correct answer moved to
    const correctOptionIndex = options.findIndex(opt => opt.letter === question.answer);
    const newAnswerLetter = ['A', 'B', 'C', 'D'][correctOptionIndex];
    
    // Return question with shuffled positions
    return {
      ...question,
      optionA: options[0].text,
      optionB: options[1].text,
      optionC: options[2].text,
      optionD: options[3].text,
      answer: newAnswerLetter
    };
  }

  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionsByMode(mode: QuizMode, count: number): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    
    if (mode === "scenario") {
      const scenarioQuestions = allQuestions.filter(q => q.scenarioId);
      const scenarioGroups = new Map<string, Question[]>();
      
      // Group questions by scenario
      scenarioQuestions.forEach(q => {
        if (!scenarioGroups.has(q.scenarioId!)) {
          scenarioGroups.set(q.scenarioId!, []);
        }
        scenarioGroups.get(q.scenarioId!)!.push(q);
      });
      
      // Get all complete scenarios (with exactly 3 questions each)
      const completeScenarios = Array.from(scenarioGroups.values()).filter(
        group => group.length === 3
      );
      
      // Shuffle the scenarios themselves randomly
      const shuffledScenarios = completeScenarios.sort(() => Math.random() - 0.5);
      
      // Flatten all scenarios into one array (all 150 questions in random scenario order)
      const allScenarioQuestions = shuffledScenarios.flat();
      
      // Shuffle answer positions for all scenario questions
      return allScenarioQuestions.map(q => this.shuffleAnswerPositions(q));
    }
    
    if (mode === "practice") {
      // Get scenario questions for practice mode
      const scenarioQuestions = allQuestions.filter(q => q.scenarioId);
      const scenarioGroups = new Map<string, Question[]>();
      
      // Group questions by scenario
      scenarioQuestions.forEach(q => {
        if (!scenarioGroups.has(q.scenarioId!)) {
          scenarioGroups.set(q.scenarioId!, []);
        }
        scenarioGroups.get(q.scenarioId!)!.push(q);
      });
      
      // Get all complete scenarios (with exactly 3 questions each)
      const completeScenarios = Array.from(scenarioGroups.values()).filter(
        group => group.length === 3
      );
      
      // Shuffle scenarios and pick 2 random scenarios
      const shuffledScenarios = completeScenarios.sort(() => Math.random() - 0.5);
      const twoScenarios = shuffledScenarios.slice(0, 2);
      
      // Take 2 questions from each scenario (4 questions total)
      const practiceScenarioQuestions = twoScenarios.flatMap(scenario => 
        scenario.slice(0, 2)
      );
      
      // Get regular non-scenario questions
      const nonScenarioQuestions = allQuestions.filter(q => !q.scenarioId);
      const shuffledRegular = nonScenarioQuestions.sort(() => Math.random() - 0.5);
      
      // Calculate how many regular questions we need
      const requestedCount = Math.min(count, 10);
      const regularQuestionsNeeded = Math.max(0, requestedCount - 4);
      
      // Combine scenario questions with regular questions
      const finalQuestions = [
        ...practiceScenarioQuestions,
        ...shuffledRegular.slice(0, regularQuestionsNeeded)
      ];
      
      // Shuffle the combined array so scenarios aren't always first
      const mixedQuestions = finalQuestions.sort(() => Math.random() - 0.5);
      
      // Shuffle answer positions for all questions before returning
      return mixedQuestions.map(q => this.shuffleAnswerPositions(q));
    }
    
    // Exam mode: 100 regular questions only
    const nonScenarioQuestions = allQuestions.filter(q => !q.scenarioId);
    const shuffled = nonScenarioQuestions.sort(() => Math.random() - 0.5);
    
    // Shuffle answer positions for all questions before returning
    return shuffled.slice(0, 100).map(q => this.shuffleAnswerPositions(q));
  }

  async getRandomAdvert(): Promise<Advert> {
    const randomIndex = Math.floor(Math.random() * this.adverts.length);
    return this.adverts[randomIndex];
  }

  async recordExamPurchase(paymentIntentId: string): Promise<string> {
    const accessToken = randomUUID();
    this.examAccessTokens.set(accessToken, paymentIntentId);
    return accessToken;
  }

  async recordScenarioPurchase(paymentIntentId: string): Promise<string> {
    const accessToken = randomUUID();
    this.scenarioAccessTokens.set(accessToken, paymentIntentId);
    return accessToken;
  }

  async recordBundlePurchase(paymentIntentId: string): Promise<string> {
    const accessToken = randomUUID();
    this.bundleAccessTokens.set(accessToken, paymentIntentId);
    return accessToken;
  }

  async checkExamAccess(accessToken: string): Promise<boolean> {
    // Bundle gives access to exam too
    return this.examAccessTokens.has(accessToken) || this.bundleAccessTokens.has(accessToken);
  }

  async checkScenarioAccess(accessToken: string): Promise<boolean> {
    // Bundle gives access to scenarios too
    return this.scenarioAccessTokens.has(accessToken) || this.bundleAccessTokens.has(accessToken);
  }
}

export const storage = new MemStorage();
