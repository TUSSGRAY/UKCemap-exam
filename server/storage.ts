import type { Question, InsertQuestion, QuizMode, Advert } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllQuestions(): Promise<Question[]>;
  getQuestionsByMode(mode: QuizMode, count: number): Promise<Question[]>;
  getRandomAdvert(): Promise<Advert>;
}

export class MemStorage implements IStorage {
  private questions: Map<string, Question>;
  private adverts: Advert[];

  constructor() {
    this.questions = new Map();
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
      // Regulation and Ethics (15 questions)
      {
        topic: "Regulation and Ethics",
        question: "Which body regulates mortgage advice in the UK?",
        optionA: "FCA",
        optionB: "PRA",
        optionC: "Bank of England",
        optionD: "FSCS",
        answer: "A"
      },
      {
        topic: "Regulation and Ethics",
        question: "What is the primary purpose of the FCA?",
        optionA: "To set interest rates",
        optionB: "To protect consumers and ensure market integrity",
        optionC: "To provide mortgages",
        optionD: "To insure deposits",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "Under FCA rules, advisers must act with:",
        optionA: "Profitability in mind",
        optionB: "Integrity, due skill, care and diligence",
        optionC: "Speed over accuracy",
        optionD: "Minimum disclosure",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "What does 'treating customers fairly' (TCF) require?",
        optionA: "Offering the cheapest products",
        optionB: "Fair outcomes for customers throughout the product lifecycle",
        optionC: "Maximum sales targets",
        optionD: "Selling to everyone who applies",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "How long must firms keep records of mortgage advice?",
        optionA: "1 year",
        optionB: "3 years",
        optionC: "5 years",
        optionD: "Indefinitely",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "What is the purpose of the Senior Managers Regime?",
        optionA: "To increase salaries",
        optionB: "To hold individuals accountable for regulatory failings",
        optionC: "To reduce staff numbers",
        optionD: "To simplify compliance",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "Which principle requires firms to pay due regard to client interests?",
        optionA: "Principle 1",
        optionB: "Principle 6",
        optionC: "Principle 11",
        optionD: "Principle 3",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "What is the role of the Financial Ombudsman Service?",
        optionA: "To regulate firms",
        optionB: "To resolve disputes between consumers and firms",
        optionC: "To set mortgage rates",
        optionD: "To provide insurance",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "What does FSCS stand for?",
        optionA: "Financial Services Compensation Scheme",
        optionB: "Financial Standards Control System",
        optionC: "Fraud Security and Crime Service",
        optionD: "Financial Suitability Checking Service",
        answer: "A"
      },
      {
        topic: "Regulation and Ethics",
        question: "What is the maximum FSCS compensation for protected deposits?",
        optionA: "£50,000",
        optionB: "£75,000",
        optionC: "£85,000",
        optionD: "£100,000",
        answer: "C"
      },
      {
        topic: "Regulation and Ethics",
        question: "Which document outlines FCA's expectations for conduct?",
        optionA: "The Handbook",
        optionB: "The Constitution",
        optionC: "The Guidance Manual",
        optionD: "The Standards Book",
        answer: "A"
      },
      {
        topic: "Regulation and Ethics",
        question: "What is a Controlled Function?",
        optionA: "Any job in finance",
        optionB: "A function requiring FCA approval",
        optionC: "Automated processes",
        optionD: "Back-office operations",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "What does KYC stand for?",
        optionA: "Know Your Customer",
        optionB: "Keep Your Conduct",
        optionC: "Key Yearly Compliance",
        optionD: "Knowledge Yields Credit",
        answer: "A"
      },
      {
        topic: "Regulation and Ethics",
        question: "Which Act introduced the requirement for firms to be authorized?",
        optionA: "Banking Act 2008",
        optionB: "Financial Services and Markets Act 2000",
        optionC: "Consumer Rights Act 2015",
        optionD: "Data Protection Act 2018",
        answer: "B"
      },
      {
        topic: "Regulation and Ethics",
        question: "What is the consequence of providing mortgage advice without authorization?",
        optionA: "A warning letter",
        optionB: "Criminal prosecution and unlimited fine",
        optionC: "Temporary suspension",
        optionD: "Re-training requirement",
        answer: "B"
      },
      // Mortgage Law (15 questions)
      {
        topic: "Mortgage Law",
        question: "What is a 'charge' in relation to a mortgage?",
        optionA: "A fee paid by the borrower",
        optionB: "A lender's legal right over the property",
        optionC: "An insurance policy",
        optionD: "A type of interest rate",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is the legal term for ownership of property?",
        optionA: "Title",
        optionB: "Deed",
        optionC: "Conveyance",
        optionD: "Assignment",
        answer: "A"
      },
      {
        topic: "Mortgage Law",
        question: "Which type of ownership allows co-owners to leave their share in a will?",
        optionA: "Joint tenancy",
        optionB: "Tenants in common",
        optionC: "Leasehold",
        optionD: "Freehold absolute",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is the difference between freehold and leasehold?",
        optionA: "Price only",
        optionB: "Freehold is permanent ownership, leasehold is temporary",
        optionC: "Location only",
        optionD: "No difference",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is equity in property terms?",
        optionA: "The mortgage amount",
        optionB: "The difference between property value and outstanding mortgage",
        optionC: "The purchase price",
        optionD: "The monthly payment",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What does LTV stand for?",
        optionA: "Long Term Value",
        optionB: "Loan to Value",
        optionC: "Lender's Total View",
        optionD: "Legal Title Valuation",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is the purpose of a mortgage deed?",
        optionA: "To transfer ownership",
        optionB: "To create a legal charge over the property",
        optionC: "To value the property",
        optionD: "To insure the property",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is repossession?",
        optionA: "Buying back a property",
        optionB: "The lender taking back the property due to non-payment",
        optionC: "Selling a property",
        optionD: "Transferring ownership",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is a first charge?",
        optionA: "The initial fee",
        optionB: "The primary legal claim on a property",
        optionC: "The first payment",
        optionD: "The application fee",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is negative equity?",
        optionA: "When property value exceeds the mortgage",
        optionB: "When the mortgage exceeds the property value",
        optionC: "A type of mortgage product",
        optionD: "A government scheme",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What does conveyancing involve?",
        optionA: "Property valuation",
        optionB: "Legal transfer of property ownership",
        optionC: "Mortgage advice",
        optionD: "Property insurance",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is a second charge mortgage?",
        optionA: "A second property",
        optionB: "An additional loan secured against the same property",
        optionC: "A remortgage",
        optionD: "A type of insurance",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is a redemption penalty?",
        optionA: "A reward for early repayment",
        optionB: "A charge for repaying the mortgage early",
        optionC: "A monthly fee",
        optionD: "An insurance premium",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What does HMO stand for in property terms?",
        optionA: "House Mortgage Option",
        optionB: "House in Multiple Occupation",
        optionC: "High Mortgage Ownership",
        optionD: "Home Management Organization",
        answer: "B"
      },
      {
        topic: "Mortgage Law",
        question: "What is the Land Registry?",
        optionA: "A government body that records land ownership",
        optionB: "A lender",
        optionC: "An insurance company",
        optionD: "A property developer",
        answer: "A"
      },
      // Financial Advice Process (13 questions)
      {
        topic: "Financial Advice Process",
        question: "What is the main purpose of a fact find?",
        optionA: "To test the client's financial knowledge",
        optionB: "To collect information about the client's needs and circumstances",
        optionC: "To check the client's credit history",
        optionD: "To recommend specific lenders",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What does KFI stand for?",
        optionA: "Key Facts Illustration",
        optionB: "Knowledge For Investors",
        optionC: "Known Financial Information",
        optionD: "Key Financial Index",
        answer: "A"
      },
      {
        topic: "Financial Advice Process",
        question: "What is the purpose of a suitability report?",
        optionA: "To list all available products",
        optionB: "To explain why a recommendation is suitable for the client",
        optionC: "To advertise products",
        optionD: "To calculate fees",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What does AIP stand for?",
        optionA: "Annual Interest Payment",
        optionB: "Agreement in Principle",
        optionC: "Assessed Income Period",
        optionD: "Automated Investment Portfolio",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What is affordability assessment?",
        optionA: "Checking if the client likes the property",
        optionB: "Evaluating if the client can afford mortgage payments now and in future",
        optionC: "Comparing house prices",
        optionD: "Calculating insurance costs",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What information is NOT typically included in a fact find?",
        optionA: "Income and expenditure",
        optionB: "Political opinions",
        optionC: "Employment status",
        optionD: "Financial commitments",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What is the purpose of a credit check?",
        optionA: "To assess creditworthiness and repayment history",
        optionB: "To set interest rates",
        optionC: "To value the property",
        optionD: "To calculate insurance",
        answer: "A"
      },
      {
        topic: "Financial Advice Process",
        question: "What does DIP stand for?",
        optionA: "Decision in Principle",
        optionB: "Deposit Insurance Plan",
        optionC: "Direct Investment Portfolio",
        optionD: "Default Interest Payment",
        answer: "A"
      },
      {
        topic: "Financial Advice Process",
        question: "Why is it important to assess a client's attitude to risk?",
        optionA: "It's not important",
        optionB: "To match them with suitable products",
        optionC: "To deny them a mortgage",
        optionD: "To increase fees",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What is a vulnerable customer?",
        optionA: "Any customer seeking advice",
        optionB: "Someone whose circumstances make them susceptible to harm",
        optionC: "A first-time buyer",
        optionD: "Someone with poor credit",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "When must a KFI be provided?",
        optionA: "After completion",
        optionB: "Before an application is made",
        optionC: "Never",
        optionD: "Only if requested",
        answer: "B"
      },
      {
        topic: "Financial Advice Process",
        question: "What is the reflection period?",
        optionA: "Time to think about advice before proceeding",
        optionB: "Time to pay the mortgage",
        optionC: "Time to move house",
        optionD: "Time to get insurance",
        answer: "A"
      },
      {
        topic: "Financial Advice Process",
        question: "What does the adviser disclosure document explain?",
        optionA: "Property prices",
        optionB: "The services offered and how the adviser is paid",
        optionC: "Lender criteria",
        optionD: "Market trends",
        answer: "B"
      },
      // Mortgage Products (15 questions)
      {
        topic: "Mortgage Products",
        question: "Which of the following has interest that remains the same throughout the mortgage term?",
        optionA: "Tracker mortgage",
        optionB: "Discount mortgage",
        optionC: "Fixed-rate mortgage",
        optionD: "Variable-rate mortgage",
        answer: "C"
      },
      {
        topic: "Mortgage Products",
        question: "What is a tracker mortgage?",
        optionA: "A mortgage that tracks property values",
        optionB: "A mortgage that tracks a specified rate, usually Bank of England base rate",
        optionC: "A mortgage for tracking expenses",
        optionD: "A type of insurance",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a capped rate mortgage?",
        optionA: "A mortgage with a maximum interest rate limit",
        optionB: "A mortgage with no upper limit",
        optionC: "A fixed rate mortgage",
        optionD: "A government scheme",
        answer: "A"
      },
      {
        topic: "Mortgage Products",
        question: "What is an offset mortgage?",
        optionA: "A mortgage for older properties",
        optionB: "A mortgage where savings offset the mortgage balance",
        optionC: "A type of insurance",
        optionD: "A government scheme",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a buy-to-let mortgage?",
        optionA: "A mortgage for first-time buyers",
        optionB: "A mortgage for properties to be rented out",
        optionC: "A shared ownership scheme",
        optionD: "A government initiative",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is an interest-only mortgage?",
        optionA: "Payments cover only interest, capital repaid at end",
        optionB: "Payments cover capital only",
        optionC: "No payments required",
        optionD: "Fixed monthly payments",
        answer: "A"
      },
      {
        topic: "Mortgage Products",
        question: "What is a repayment mortgage?",
        optionA: "Interest only",
        optionB: "Payments cover both interest and capital",
        optionC: "No interest charged",
        optionD: "Lump sum payment at end",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a discount mortgage?",
        optionA: "A reduced price property",
        optionB: "A mortgage with a discount off the lender's standard variable rate",
        optionC: "A government scheme",
        optionD: "A cashback offer",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a flexible mortgage?",
        optionA: "A mortgage with rigid terms",
        optionB: "A mortgage allowing overpayments, underpayments, and payment holidays",
        optionC: "A type of insurance",
        optionD: "A government scheme",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a cashback mortgage?",
        optionA: "A mortgage where you pay cash",
        optionB: "A mortgage offering a lump sum at start",
        optionC: "A savings account",
        optionD: "A type of insurance",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is the SVR?",
        optionA: "Secure Value Rate",
        optionB: "Standard Variable Rate",
        optionC: "Special Valuation Report",
        optionD: "Savings Value Rating",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a Help to Buy mortgage?",
        optionA: "A government scheme to help buyers get on the property ladder",
        optionB: "A charity program",
        optionC: "A type of insurance",
        optionD: "A savings account",
        answer: "A"
      },
      {
        topic: "Mortgage Products",
        question: "What is a shared ownership mortgage?",
        optionA: "Buying part of a property and renting the rest",
        optionB: "Joint ownership with a friend",
        optionC: "A government scheme only",
        optionD: "A type of insurance",
        answer: "A"
      },
      {
        topic: "Mortgage Products",
        question: "What is a remortgage?",
        optionA: "Buying a second property",
        optionB: "Switching to a new mortgage deal, often with a different lender",
        optionC: "Selling your property",
        optionD: "Extending the mortgage term",
        answer: "B"
      },
      {
        topic: "Mortgage Products",
        question: "What is a base rate tracker?",
        optionA: "A fixed rate",
        optionB: "A rate that moves in line with the Bank of England base rate",
        optionC: "An insurance product",
        optionD: "A savings account",
        answer: "B"
      },
      // Protection Products (12 questions)
      {
        topic: "Protection Products",
        question: "What does critical illness cover provide?",
        optionA: "A lump sum if the policyholder dies",
        optionB: "Monthly income on redundancy",
        optionC: "A lump sum on diagnosis of certain illnesses",
        optionD: "Refund of mortgage payments",
        answer: "C"
      },
      {
        topic: "Protection Products",
        question: "What is life assurance?",
        optionA: "Health insurance",
        optionB: "Cover that pays out on death",
        optionC: "Car insurance",
        optionD: "Property insurance",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is income protection insurance?",
        optionA: "Cover for property damage",
        optionB: "Cover providing income if unable to work due to illness or injury",
        optionC: "Life insurance",
        optionD: "Car insurance",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is MPPI?",
        optionA: "Mortgage Payment Protection Insurance",
        optionB: "Medical Professional Protection Insurance",
        optionC: "Multiple Property Purchase Insurance",
        optionD: "Market Price Protection Index",
        answer: "A"
      },
      {
        topic: "Protection Products",
        question: "What is decreasing term assurance typically used for?",
        optionA: "Increasing wealth",
        optionB: "Covering a repayment mortgage",
        optionC: "Savings",
        optionD: "Investment",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is level term assurance?",
        optionA: "Cover that decreases over time",
        optionB: "Cover that stays the same throughout the term",
        optionC: "Cover that increases over time",
        optionD: "No cover at all",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is Buildings Insurance?",
        optionA: "Insurance for the structure of the property",
        optionB: "Insurance for contents only",
        optionC: "Life insurance",
        optionD: "Car insurance",
        answer: "A"
      },
      {
        topic: "Protection Products",
        question: "What is Contents Insurance?",
        optionA: "Insurance for the building structure",
        optionB: "Insurance for possessions inside the property",
        optionC: "Life insurance",
        optionD: "Health insurance",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "Is buildings insurance compulsory for mortgage borrowers?",
        optionA: "No, it's optional",
        optionB: "Yes, lenders require it",
        optionC: "Only for flats",
        optionD: "Only for houses",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is Family Income Benefit?",
        optionA: "A lump sum payment",
        optionB: "Regular income payments to beneficiaries on death",
        optionC: "A savings plan",
        optionD: "A pension",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is a waiver of premium benefit?",
        optionA: "No premiums required",
        optionB: "Premiums paid by insurer if policyholder unable to work",
        optionC: "Discount on premiums",
        optionD: "Refund of premiums",
        answer: "B"
      },
      {
        topic: "Protection Products",
        question: "What is an excess on an insurance policy?",
        optionA: "Extra cover",
        optionB: "The amount the policyholder pays before insurance pays out",
        optionC: "A bonus payment",
        optionD: "An additional premium",
        answer: "B"
      },
      // Property Valuation (10 questions)
      {
        topic: "Property Valuation",
        question: "Which valuation method is based on comparing recent sale prices of similar properties?",
        optionA: "Cost method",
        optionB: "Income method",
        optionC: "Comparable method",
        optionD: "Residual method",
        answer: "C"
      },
      {
        topic: "Property Valuation",
        question: "What is a mortgage valuation?",
        optionA: "A detailed survey",
        optionB: "A basic assessment of property value for lending purposes",
        optionC: "A legal document",
        optionD: "An insurance policy",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What is a HomeBuyer Report?",
        optionA: "A basic valuation",
        optionB: "A mid-level survey highlighting major issues",
        optionC: "A full structural survey",
        optionD: "An insurance document",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What is a full structural survey?",
        optionA: "A basic check",
        optionB: "A comprehensive detailed inspection of the property",
        optionC: "A mortgage valuation",
        optionD: "An insurance assessment",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "Who typically instructs the mortgage valuation?",
        optionA: "The buyer",
        optionB: "The lender",
        optionC: "The seller",
        optionD: "The estate agent",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What does down-valuation mean?",
        optionA: "Property valued higher than asking price",
        optionB: "Property valued lower than the agreed purchase price",
        optionC: "Property rejected",
        optionD: "Property devalued over time",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What is the income method of valuation used for?",
        optionA: "Residential properties",
        optionB: "Investment and commercial properties",
        optionC: "New builds only",
        optionD: "Agricultural land only",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What is market value?",
        optionA: "The price on the listing",
        optionB: "The estimated price a property would achieve in the open market",
        optionC: "The purchase price",
        optionD: "The mortgage amount",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What is a retention in property valuation?",
        optionA: "A deposit",
        optionB: "Funds held back until specific work is completed",
        optionC: "A fee",
        optionD: "An insurance premium",
        answer: "B"
      },
      {
        topic: "Property Valuation",
        question: "What factors affect property valuation?",
        optionA: "Location only",
        optionB: "Location, condition, size, local amenities, market conditions",
        optionC: "Color of the walls",
        optionD: "Owner's occupation",
        answer: "B"
      },
      // Legal Aspects (10 questions)
      {
        topic: "Legal Aspects",
        question: "At what point does a mortgage offer become legally binding?",
        optionA: "When the client accepts it",
        optionB: "When funds are released",
        optionC: "On exchange of contracts",
        optionD: "On valuation approval",
        answer: "C"
      },
      {
        topic: "Legal Aspects",
        question: "What is completion in property terms?",
        optionA: "When the survey is complete",
        optionB: "When ownership legally transfers and keys are handed over",
        optionC: "When the mortgage is approved",
        optionD: "When the offer is accepted",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is exchange of contracts?",
        optionA: "Swapping properties",
        optionB: "When the sale becomes legally binding",
        optionC: "Completion",
        optionD: "Making an offer",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is a solicitor's role in property purchase?",
        optionA: "To value the property",
        optionB: "To handle legal aspects and transfer of ownership",
        optionC: "To provide mortgage advice",
        optionD: "To sell insurance",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What are searches in conveyancing?",
        optionA: "Looking for properties",
        optionB: "Legal checks on the property and local area",
        optionC: "Credit checks",
        optionD: "Insurance checks",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is gazumping?",
        optionA: "A legal process",
        optionB: "When a seller accepts a higher offer after accepting another",
        optionC: "A type of mortgage",
        optionD: "An insurance product",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is stamp duty?",
        optionA: "A postage fee",
        optionB: "Tax on property purchases over a certain value",
        optionC: "A mortgage fee",
        optionD: "An insurance premium",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is a cooling-off period?",
        optionA: "Waiting for contracts",
        optionB: "Time to cancel certain agreements without penalty",
        optionC: "Property viewing time",
        optionD: "Mortgage term",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is power of attorney?",
        optionA: "A lawyer's qualification",
        optionB: "Legal authority for someone to act on another's behalf",
        optionC: "A court order",
        optionD: "A property right",
        answer: "B"
      },
      {
        topic: "Legal Aspects",
        question: "What is a restrictive covenant?",
        optionA: "A mortgage term",
        optionB: "A legal restriction on how property can be used",
        optionC: "An insurance clause",
        optionD: "A lending criteria",
        answer: "B"
      },
      // Financial Conduct (10 questions)
      {
        topic: "Financial Conduct",
        question: "Under the FCA's principles, firms must treat customers how?",
        optionA: "As sources of profit",
        optionB: "According to their income level",
        optionC: "Fairly and transparently",
        optionD: "With minimal compliance",
        answer: "C"
      },
      {
        topic: "Financial Conduct",
        question: "What is the purpose of anti-money laundering regulations?",
        optionA: "To increase profits",
        optionB: "To prevent financial crime and terrorist financing",
        optionC: "To deny mortgages",
        optionD: "To increase property prices",
        answer: "B"
      },
      {
        topic: "Financial Conduct",
        question: "What does CPD stand for in professional terms?",
        optionA: "Current Product Development",
        optionB: "Continuing Professional Development",
        optionC: "Customer Protection Directive",
        optionD: "Credit Protection Document",
        answer: "B"
      },
      {
        topic: "Financial Conduct",
        question: "How many hours of CPD must CeMAP holders complete annually?",
        optionA: "10 hours",
        optionB: "15 hours",
        optionC: "35 hours",
        optionD: "50 hours",
        answer: "C"
      },
      {
        topic: "Financial Conduct",
        question: "What is a conflict of interest?",
        optionA: "Disagreeing with a client",
        optionB: "When personal interests could affect professional judgment",
        optionC: "A legal dispute",
        optionD: "A pricing issue",
        answer: "B"
      },
      {
        topic: "Financial Conduct",
        question: "What does GDPR stand for?",
        optionA: "General Data Protection Regulation",
        optionB: "Government Data Privacy Rules",
        optionC: "Global Document Protection Requirements",
        optionD: "General Deposit Protection Regime",
        answer: "A"
      },
      {
        topic: "Financial Conduct",
        question: "What is the purpose of a compliance function?",
        optionA: "To increase sales",
        optionB: "To ensure the firm meets regulatory requirements",
        optionC: "To reduce staff",
        optionD: "To set interest rates",
        answer: "B"
      },
      {
        topic: "Financial Conduct",
        question: "What is insider dealing?",
        optionA: "Legal trading",
        optionB: "Trading on confidential information for personal gain",
        optionC: "Working from home",
        optionD: "A type of mortgage",
        answer: "B"
      },
      {
        topic: "Financial Conduct",
        question: "What is the purpose of the Money Laundering Regulations?",
        optionA: "To wash money",
        optionB: "To prevent criminals from disguising illegally obtained funds",
        optionC: "To clean currency",
        optionD: "To increase taxes",
        answer: "B"
      },
      {
        topic: "Financial Conduct",
        question: "What is Professional Indemnity Insurance?",
        optionA: "Health insurance",
        optionB: "Insurance protecting against claims of professional negligence",
        optionC: "Life insurance",
        optionD: "Property insurance",
        answer: "B"
      },
      // Mortgage Market (10 questions)
      {
        topic: "Mortgage Market",
        question: "What is the primary purpose of the Mortgage Market Review (MMR)?",
        optionA: "To reduce competition",
        optionB: "To ensure responsible lending",
        optionC: "To promote fixed-rate deals",
        optionD: "To increase house prices",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What is stress testing in mortgage applications?",
        optionA: "Testing property strength",
        optionB: "Assessing if borrowers can afford payments if rates increase",
        optionC: "Credit score testing",
        optionD: "Property valuation",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What does APR stand for?",
        optionA: "Annual Percentage Rate",
        optionB: "Approved Property Rate",
        optionC: "Annual Payment Requirement",
        optionD: "Assessed Property Risk",
        answer: "A"
      },
      {
        topic: "Mortgage Market",
        question: "What is the typical maximum income multiple for mortgages?",
        optionA: "2 times income",
        optionB: "3 times income",
        optionC: "4.5 times income",
        optionD: "10 times income",
        answer: "C"
      },
      {
        topic: "Mortgage Market",
        question: "What is a product transfer?",
        optionA: "Selling your property",
        optionB: "Moving to a new mortgage deal with your existing lender",
        optionC: "Transferring ownership",
        optionD: "Buying a new product",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What is a mortgage prisoner?",
        optionA: "Someone in jail",
        optionB: "Someone unable to remortgage despite being a good borrower",
        optionC: "A type of mortgage product",
        optionD: "A lending restriction",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What is the Bank of England base rate?",
        optionA: "Minimum mortgage rate",
        optionB: "The interest rate set by the Bank of England",
        optionC: "A type of mortgage",
        optionD: "Property tax rate",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What is a portfolio landlord?",
        optionA: "An art collector",
        optionB: "Someone with four or more mortgaged buy-to-let properties",
        optionC: "A property developer",
        optionD: "A mortgage adviser",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What is forbearance?",
        optionA: "A type of mortgage",
        optionB: "Lender's assistance to borrowers in financial difficulty",
        optionC: "An insurance product",
        optionD: "A legal process",
        answer: "B"
      },
      {
        topic: "Mortgage Market",
        question: "What is the purpose of the Prudential Regulation Authority (PRA)?",
        optionA: "To promote competition",
        optionB: "To ensure safety and soundness of financial institutions",
        optionC: "To set house prices",
        optionD: "To provide mortgages",
        answer: "B"
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
    
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    
    const questionCount = mode === "exam" ? 100 : Math.min(count, 10);
    
    return shuffled.slice(0, questionCount);
  }

  async getRandomAdvert(): Promise<Advert> {
    const randomIndex = Math.floor(Math.random() * this.adverts.length);
    return this.adverts[randomIndex];
  }
}

export const storage = new MemStorage();
