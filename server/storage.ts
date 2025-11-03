import type { Question, InsertQuestion, QuizMode, Advert } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllQuestions(): Promise<Question[]>;
  getQuestionsByMode(mode: QuizMode, count: number): Promise<Question[]>;
  getRandomAdvert(): Promise<Advert>;
  recordExamPurchase(paymentIntentId: string): Promise<string>;
  checkExamAccess(accessToken: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private questions: Map<string, Question>;
  private adverts: Advert[];
  private examAccessTokens: Map<string, string>;

  constructor() {
    this.questions = new Map();
    this.examAccessTokens = new Map();
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
    ];

    questionBank.forEach((q) => {
      const id = randomUUID();
      const question: Question = { ...q, id };
      this.questions.set(id, question);
    });
  }

  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionsByMode(mode: QuizMode, count: number): Promise<Question[]> {
    const allQuestions = Array.from(this.questions.values());
    
    if (mode === "scenario") {
      const scenarioQuestions = allQuestions.filter(q => q.scenarioId);
      const scenarioGroups = new Map<string, Question[]>();
      
      scenarioQuestions.forEach(q => {
        if (!scenarioGroups.has(q.scenarioId!)) {
          scenarioGroups.set(q.scenarioId!, []);
        }
        scenarioGroups.get(q.scenarioId!)!.push(q);
      });
      
      const completeScenarios = Array.from(scenarioGroups.values()).filter(
        group => group.length === 3
      );
      
      const randomScenario = completeScenarios[
        Math.floor(Math.random() * completeScenarios.length)
      ];
      
      return randomScenario || [];
    }
    
    const nonScenarioQuestions = allQuestions.filter(q => !q.scenarioId);
    const shuffled = nonScenarioQuestions.sort(() => Math.random() - 0.5);
    
    const questionCount = mode === "exam" ? 100 : Math.min(count, 10);
    
    return shuffled.slice(0, questionCount);
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

  async checkExamAccess(accessToken: string): Promise<boolean> {
    return this.examAccessTokens.has(accessToken);
  }
}

export const storage = new MemStorage();
