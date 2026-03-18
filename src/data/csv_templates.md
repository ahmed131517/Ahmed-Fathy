# CSV Templates for Medication Database

To import data successfully, create CSV files with the following headers. Ensure the data types match the database schema.

### 1. drugs.csv
```csv
generic_name,drug_class,atc_code
Paracetamol,Analgesic,N02BE01
Omeprazole,Proton Pump Inhibitor,A02BC01
```

### 2. drug_brands.csv
```csv
drug_id,brand_name,manufacturer
1,Panadol,GSK
2,Losec,AstraZeneca
```

### 3. dosage_forms.csv
```csv
form_name
tablet
capsule
syrup
injection
```

### 4. drug_strengths.csv
```csv
drug_id,strength,unit
1,500,mg
2,20,mg
```

### 5. drug_dosage_guidelines.csv
```csv
drug_id,indication,adult_dose,pediatric_dose,max_dose,frequency
2,GERD,20 mg,N/A,40 mg,daily
```

### 6. drug_interactions.csv
```csv
drug1_id,drug2_id,severity,description
1,2,Minor,Example interaction
```

### 7. drug_contraindications.csv
```csv
drug_id,condition,severity
1,Liver Failure,Major
```

### 8. drug_side_effects.csv
```csv
drug_id,side_effect,frequency
1,Nausea,Rare
```

### 9. drug_indications.csv
```csv
drug_id,disease
2,GERD
```
