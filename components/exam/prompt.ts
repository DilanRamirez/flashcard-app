export const aiExamPrompt = (numQuestions: number) =>
  `
You are an AWS-certified Cloud Practitioner instructor. Generate ${numQuestions} practice questions in the style, tone and difficulty of the real AWS Certified Cloud Practitioner (CLF-C02) exam. These questions are presented in a format of multiple choice. Follow these rules exactly. Use the Weighting to generate the questions proportional to the exam domains. Use the following guidelines:

Topic areas for the AWS Certified Cloud Practitioner level:
	1.	AWS Global Infrastructure & Regions
	2.	Account Management & Governance (AWS Organizations, consolidated billing)
	3.	Shared Responsibility Model
	4.	Identity & Access Management (IAM) Basics (users, access keys, MFA)
	5.	Basic Storage Services & Classes (S3, EBS, EFS; Intelligent-Tiering, Glacier)
	6.	Basic Compute Services (EC2 instance types, On-Demand pricing, AMIs, snapshots)
	7.	Basic Database Services (Amazon RDS, DynamoDB, ElastiCache)
	8.	Networking Fundamentals (VPC, subnets, security groups, NACLs)
	9.	Content Delivery & Edge Services (CloudFront, Edge Locations, S3 Transfer Acceleration)
	10.	Monitoring, Logging & Change Management (CloudWatch, CloudTrail, AWS Config)
	11.	Cost Management & Optimization (AWS Budgets, Cost Explorer, right-sizing, storage-class tuning)
	12.	Security Services & Compliance (Trusted Advisor, Inspector, WAF, penetration-testing rules)
	13.	Elasticity & Scalability (Auto Scaling, Elastic Load Balancing)
	14.	Serverless & Container Services (AWS Lambda, Amazon ECS)
	15.	Analytics & Big Data Foundations (Amazon EMR)
	16.	Advanced Networking (AWS Direct Connect, Global Accelerator)
	17.	Well-Architected Framework & Design Principles (operational excellence, “design for failure,” best practices)
	18.	AWS Support & Professional Services (Support plans, Infrastructure Event Management, Professional Services)
	19. Amazon Macie, Amazon Aurora, AWS Certificate Manager, AWS Application Migration Service.

    Domain 1 Cloud Concepts
    - AWS Global Infra & Regions; Account Mgmt & Governance; Operational Excellence
    Domain 2 Security & Compliance
    - Shared Responsibility; IAM (users, roles, policies, MFA); Security Services (Trusted Advisor, Inspector, WAF, pen-test); Well-Architected Security
    Domain 3 Technology
    - Compute (EC2, Lambda, ECS); Storage (S3 & classes, EBS, EFS); DB & Cache (RDS, DynamoDB, ElastiCache); Networking & Edge (VPC, SG/NACL, CloudFront, Direct Connect, Global Accelerator); Monitoring & Change Mgmt (CloudWatch, CloudTrail, Config); Elasticity & Scalability (Auto Scaling, ELB); Analytics (EMR)
    Domain 4 Billing & Pricing
    - Cost Mgmt (Budgets, Cost Explorer, RI/Savings Plans, tags); Support & Pro Services (Support plans, IEM, Concierge, TAM)

    • Do not include explanations or markdown—output raw JSON only.
    • Distribute questions across the four domains proportional to exam weight:
      – Domain 1 (Cloud Concepts, ~26%)
      – Domain 2 (Security & Compliance, ~25%)
      – Domain 3 (Technology, ~33%)
      – Domain 4 (Billing & Pricing, ~16%)
    • Always Ensure a difficulty of 100% expert.
    • Use realistic AWS 2025 service names and features only.
    • Randomize question order and choice order to avoid patterns.

    Example questions:
    1. What is the MINIMUM AWS Support plan that provides technical support through phone calls?
    2. What are benefits of using the AWS Cloud for companies with customers in many countries around the world? (Select TWO.)
    3. A company has an on-premises Linux-based server with an Oracle database that runs on it. The company wants to migrate the database server to run on an Amazon EC2 instance in AWS.
    4. Which service should the company use to complete the migration?
    5. A user needs to automatically discover, classify, and protect sensitive data stored in Amazon S3.
    6. Which AWS service can meet these requirements?
    7. Which AWS service allows customers to purchase unused Amazon EC2 capacity at an often discounted rate?
    8. Which AWS service identifies security groups that allow unrestricted access to a user's AWS resources?
    9. A company is hosting a static website from a single Amazon S3 bucket.
    10. Which AWS service will achieve lower latency and high transfer speeds?
    11. An application development team needs a solution that sends an alert to an entire development team if a quality assurance test fails on an application.
    12. Which AWS service should the application development team use to meet the requirement?
    13. Which AWS service should be used to implement encryption in transit?

    ONLY GENERATE THE TOTAL NUMBER OF QUESTIONS REQUESTED. DO NOT GENERATE MORE OR LESS THAN ${numQuestions} QUESTIONS.

    ### Required Output Format (Raw JSON only) not markdown:    
    [
    {
        "question": "Clear, engaging multiple-choice question",
        "choices": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Exact text of correct choice",
        "difficulty": "beginner | intermediate | expert",
        "metadata": {
        "subject": "AWS Certified Cloud Practitioner",
        "course": "generate a course based on chapter context", 
        "category": "generate a category based on chapter context",
        "original_card_id": "generate a unique ID for this question"
        }
    }
    ]
`.trim();
