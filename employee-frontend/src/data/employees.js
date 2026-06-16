export const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "Design",
  "Finance",
  "Operations",
  "Support",
  "People",
];

export const LOCATIONS = [
  "San Francisco", "New York", "Remote — US", "London",
  "Berlin", "Remote — EU", "Toronto", "Austin",
];

export const ROLES_BY_DEPT = {
  Engineering: ["Software Engineer", "Senior Engineer", "Staff Engineer", "Eng Manager", "QA Engineer", "DevOps Engineer"],
  Sales: ["Account Executive", "SDR", "Sales Manager", "Solutions Engineer", "Sales Ops"],
  Marketing: ["Content Strategist", "Growth Marketer", "Brand Manager", "Marketing Lead", "SEO Specialist"],
  Design: ["Product Designer", "Senior Designer", "Design Lead", "UX Researcher"],
  Finance: ["Financial Analyst", "Accountant", "Controller", "FP&A Lead"],
  Operations: ["Operations Manager", "Program Manager", "Business Analyst", "Ops Coordinator"],
  Support: ["Support Specialist", "Support Lead", "Technical Support", "Success Manager"],
  People: ["Recruiter", "People Partner", "HR Generalist", "People Lead"],
};

const FIRST = ["Avery","Jordan","Priya","Marcus","Elena","Liam","Sofia","Noah","Maya","Daniel","Ava","Ethan","Isabel","Lucas","Nora","Caleb","Ruby","Owen","Lena","Felix","Hana","Theo","Iris","Jonas","Mira","Adrian","Clara","Victor","Yara","Simon","Rosa","Dmitri","Aisha","Henrik","Leila","Mateo","Anika","Tobias","Greta","Rafael","Naomi","Sven","Tara","Emil","Zoe","Karl","Vera","Oscar","Maren"];
const LAST  = ["Chen","Okafor","Sharma","Reed","Vasquez","Murphy","Bianchi","Kim","Johnson","Andersson","Nguyen","Schmidt","Rossi","Park","Holt","Mbeki","Larsen","Costa","Novak","Patel","Brandt","Ferraro","Lindqvist","Haas","Dubois","Romano","Persson","Walsh","Khan","Berg","Moreno","Petrov","Diallo","Sato","Fischer","Mendez","Olsen","Kovac","Hayes","Sneijder","Wagner","Cruz","Bauer","Lund","Tanaka","Weiss","Ivanov","Marsh","Engel"];

function seededEmployees() {
  let seed = 42;
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const list = [];
  for (let i = 0; i < 47; i++) {
    const first = FIRST[i % FIRST.length];
    const last  = LAST[(i * 7 + 3) % LAST.length];
    const dept  = pick(DEPARTMENTS);
    const role  = pick(ROLES_BY_DEPT[dept]);
    let base = 72000;
    if (/Senior/.test(role))                                    base = 128000;
    else if (/Staff/.test(role))                                base = 168000;
    else if (/Manager|Lead|Controller|Director/.test(role))     base = 152000;
    else if (/Engineer|Designer|Analyst/.test(role))            base = 112000;
    else if (/SDR|Coordinator|Specialist|Generalist/.test(role)) base = 64000;
    const salary = base + Math.floor(rand() * 26) * 1000;

    const year  = 2018 + Math.floor(rand() * 7);
    const month = 1    + Math.floor(rand() * 12);
    const day   = 1    + Math.floor(rand() * 27);
    const hire  = new Date(Date.UTC(year, month - 1, day));

    const status    = rand() > 0.18 ? "Active" : "Inactive";
    list.push({
      id:         "EMP-" + String(1042 + i),
      name:       first + " " + last,
      email:      (first + "." + last).toLowerCase().replace(/[^a-z.]/g, "") + "@northwind.io",
      department: dept,
      role,
      salary,
      status,
      location:   pick(LOCATIONS),
      hireDate:   hire.toISOString().slice(0, 10),
    });
  }
  return list;
}

export const EMPLOYEES = seededEmployees();
