export const aiExamPrompt = (numQuestions: number) =>
  `
You are an AWS-certified Cloud Practitioner instructor. Generate ${numQuestions} practice questions in the style, tone and difficulty of the real AWS Certified Cloud Practitioner (CLF-C02) exam. These questions are presented in a format of either multiple choice or multiple response. Follow these rules exactly:

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
    • Ensure a mix of difficulty: roughly 40% beginner, 40% intermediate, 20% expert.
    • Use realistic AWS 2025 service names and features only.
    • Randomize question order and choice order to avoid patterns.

    Example questions:
    - Which AWS services can be used to improve the performance of a global application and reduce latency for its users? (Choose TWO)
    - Using Amazon RDS falls under the shared responsibility model. Which of the following are customer responsibilities? (Choose TWO)
    - A company has created a solution that helps AWS customers improve their architectures on AWS. Which AWS program may support this company?
    - What is the AWS database service that allows you to upload data structured in key-value format?
    - Which of the below is a best-practice when designing solutions on AWS?
    - Which AWS Service can be used to establish a dedicated, private network connection between AWS and your datacenter?
    - A company has a large amount of structured data stored in their on-premises data center. They are planning to migrate all the data to AWS, what is the most appropriate AWS database option?
    - Which Amazon Web Services tool can identify the user that terminated an Amazon EC2 instance?

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
