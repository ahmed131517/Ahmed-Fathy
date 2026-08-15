import fs from 'fs';

let content = fs.readFileSync('src/pages/Prescriptions.tsx', 'utf8');
content = content.replace(/'Amoxicillin': 'Amoxil',/, "'Amoxicillin': 'Ibiamox / E-mox',");
content = content.replace(/'Lisinopril': 'Prinivil \/ Zestril',/, "'Lisinopril': 'Zestril',");
content = content.replace(/'Metformin': 'Glucophage',/, "'Metformin': 'Cidophage / Glucophage',");
content = content.replace(/'Atorvastatin': 'Lipitor',/, "'Atorvastatin': 'Ator / Lipitor',");
content = content.replace(/'Ibuprofen': 'Advil \/ Motrin',/, "'Ibuprofen': 'Brufen',");
content = content.replace(/'Azithromycin': 'Zithromax',/, "'Azithromycin': 'Zithrokan',");
content = content.replace(/'Sertraline': 'Zoloft',/, "'Sertraline': 'Lustral / Sirpass',");
content = content.replace(/'Levothyroxine': 'Synthroid',/, "'Levothyroxine': 'Eltroxin / Thyrox',");
content = content.replace(/'Amlodipine': 'Norvasc',/, "'Amlodipine': 'Alkacap',");
content = content.replace(/'Omeprazole': 'Prilosec',/, "'Omeprazole': 'Losec / Omez',");
content = content.replace(/'Losartan': 'Cozaar',/, "'Losartan': 'Amzaar',");
content = content.replace(/'Metoprolol': 'Lopressor',/, "'Metoprolol': 'Betaloc',");

fs.writeFileSync('src/pages/Prescriptions.tsx', content);

let content2 = fs.readFileSync('src/pages/EncounterNote.tsx', 'utf8');
content2 = content2.replace(/'Amoxicillin': 'Amoxil',/, "'Amoxicillin': 'Ibiamox / E-mox',");
content2 = content2.replace(/'Lisinopril': 'Prinivil \/ Zestril',/, "'Lisinopril': 'Zestril',");
content2 = content2.replace(/'Metformin': 'Glucophage',/, "'Metformin': 'Cidophage / Glucophage',");
content2 = content2.replace(/'Atorvastatin': 'Lipitor',/, "'Atorvastatin': 'Ator / Lipitor',");
content2 = content2.replace(/'Ibuprofen': 'Advil \/ Motrin',/, "'Ibuprofen': 'Brufen',");
content2 = content2.replace(/'Azithromycin': 'Zithromax',/, "'Azithromycin': 'Zithrokan',");
content2 = content2.replace(/'Sertraline': 'Zoloft',/, "'Sertraline': 'Lustral / Sirpass',");
content2 = content2.replace(/'Levothyroxine': 'Synthroid',/, "'Levothyroxine': 'Eltroxin / Thyrox',");
content2 = content2.replace(/'Amlodipine': 'Norvasc',/, "'Amlodipine': 'Alkacap',");
content2 = content2.replace(/'Omeprazole': 'Prilosec',/, "'Omeprazole': 'Losec / Omez',");
content2 = content2.replace(/'Losartan': 'Cozaar',/, "'Losartan': 'Amzaar',");
content2 = content2.replace(/'Metoprolol': 'Lopressor',/, "'Metoprolol': 'Betaloc',");

fs.writeFileSync('src/pages/EncounterNote.tsx', content2);
