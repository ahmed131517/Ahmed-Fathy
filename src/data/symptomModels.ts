export interface SymptomModel {
  id: string;
  label: string;
  dimensions?: Record<string, string[]>;
  redFlags?: string[];
  requiredExams?: string[];
}

export const HEAD_MODELS: SymptomModel[] = [
  {
    id: "headache_tension",
    label: "Tension Headache",
    dimensions: {
      onset: ["gradual", "sudden"],
      location: ["forehead", "temples", "back of head", "all over"],
      character: ["tight band", "dull ache", "heavy pressure"],
      severity: ["mild", "moderate", "severe"]
    },
    redFlags: [
      "Sudden 'thunderclap' onset",
      "Fever and neck stiffness",
      "New headache after age 50",
      "Worsening after head injury"
    ]
  },
  {
    id: "headache_migraine",
    label: "Migraine",
    dimensions: {
      onset: ["gradual", "with aura (visual flashes/spots)", "without aura"],
      location: ["one side of head", "behind one eye", "both sides"],
      character: ["throbbing", "pulsating", "pounding"],
      severity: ["moderate", "severe", "incapacitating"],
      associated: ["nausea/vomiting", "light sensitivity", "sound sensitivity", "smell sensitivity"]
    },
    redFlags: [
      "Sudden change in migraine pattern",
      "Weakness or numbness on one side",
      "Difficulty speaking",
      "Vision loss"
    ]
  },
  {
    id: "headache_cluster",
    label: "Cluster Headache",
    dimensions: {
      onset: ["sudden (often at night)", "recurs at same time of day"],
      location: ["strictly one side", "around or behind one eye"],
      character: ["piercing", "stabbing", "excruciating"],
      duration: ["15 minutes to 3 hours", "multiple times per day"],
      associated: ["red/watery eye", "stuffy/runny nose", "drooping eyelid on same side"]
    },
    redFlags: [
      "First ever cluster-like headache",
      "Atypical duration (more than 3 hours)",
      "Associated confusion or weakness"
    ]
  },
  {
    id: "headache_sinus",
    label: "Sinus Pain/Pressure",
    dimensions: {
      location: ["under eyes", "bridge of nose", "forehead", "upper teeth"],
      character: ["aching", "pressure", "throbbing"],
      triggers: ["leaning forward", "blowing nose", "cold weather"],
      associated: ["nasal congestion", "discolored mucus", "reduced smell"]
    },
    redFlags: [
      "Swelling or redness around eyes",
      "High fever",
      "Confusion or severe drowsiness",
      "Vision changes"
    ]
  },
  {
    id: "head_injury_concussion",
    label: "Head Injury / Concussion",
    dimensions: {
      onset: ["immediately after impact", "delayed (hours/days)"],
      physical: ["headache", "nausea", "dizziness", "fatigue", "light/noise sensitivity"],
      cognitive: ["confusion", "feeling 'in a fog'", "memory loss", "difficulty concentrating"],
      emotional: ["irritability", "sadness", "anxiety", "more emotional than usual"]
    },
    redFlags: [
      "Loss of consciousness",
      "Repeated vomiting",
      "Seizures",
      "Unequal pupil size",
      "Slurred speech",
      "Worsening confusion"
    ]
  },
  {
    id: "head_dizziness_vertigo",
    label: "Dizziness or Vertigo",
    dimensions: {
      onset: ["sudden", "gradual"],
      type: ["spinning (vertigo)", "lightheadedness", "unsteadiness", "feeling of fainting"],
      triggers: ["standing up", "turning head", "rolling over in bed", "stress"],
      duration: ["seconds", "minutes", "hours", "constant"]
    },
    redFlags: [
      "Sudden hearing loss",
      "Double vision",
      "Difficulty speaking or swallowing",
      "Facial drooping or limb weakness"
    ]
  },
  {
    id: "facial_weakness_paralysis",
    label: "Facial Weakness or Drooping (Bell's Palsy)",
    dimensions: {
      onset: ["sudden (over hours/days)", "gradual"],
      location: ["one side of face", "both sides (rare)"],
      severity: ["mild weakness", "complete paralysis"],
      associated: ["difficulty closing eye", "drooling", "change in taste", "pain behind ear"]
    },
    redFlags: [
      "Weakness also in arms or legs (Stroke concern)",
      "Difficulty speaking or understanding speech",
      "Severe headache or vision changes",
      "History of recent trauma"
    ]
  },
  {
    id: "facial_pain",
    label: "Facial Pain",
    dimensions: {
      location: ["cheek", "jaw", "around eye", "forehead"],
      character: ["electric shock-like", "sharp/stabbing", "burning", "dull ache"],
      triggers: ["touching face", "chewing", "talking", "cold wind"]
    },
    redFlags: [
      "Unexplained facial swelling",
      "Persistent numbness",
      "Pain preventing eating/drinking",
      "New skin lesions in the painful area"
    ]
  },
  {
    id: "dental_tooth_pain",
    label: "Toothache or Dental Pain",
    dimensions: {
      location: ["upper teeth", "lower teeth", "radiating to jaw/ear"],
      character: ["sharp", "throbbing", "constant", "only when chewing"],
      triggers: ["hot or cold food/drink", "sweet food", "biting down"]
    },
    redFlags: [
      "Swelling in the gums or face",
      "Fever and chills",
      "Difficulty swallowing or breathing",
      "Foul taste or discharge in mouth"
    ]
  },
  {
    id: "jaw_pain_tmj",
    label: "Jaw Pain (TMJ)",
    dimensions: {
      location: ["jaw joint", "in front of ear", "side of face"],
      character: ["aching", "stiffness", "clicking/popping sound"],
      triggers: ["chewing", "yawning", "stress/teeth grinding"]
    },
    redFlags: [
      "Jaw locked open or closed",
      "Severe swelling in the jaw area",
      "Difficulty breathing or swallowing",
      "High fever"
    ]
  },
  {
    id: "neck_swelling_lumps",
    label: "Neck Swelling or Lumps (Lymph Nodes)",
    dimensions: {
      location: ["under jaw", "side of neck", "back of neck", "above collarbone"],
      character: ["tender/painful", "painless", "soft/rubbery", "hard/fixed"],
      onset: ["sudden (with infection)", "gradual"]
    },
    redFlags: [
      "Hard, fixed, non-tender lump",
      "Lump larger than 1 inch",
      "Rapidly growing lump",
      "Unexplained weight loss or night sweats",
      "Difficulty swallowing or persistent hoarseness"
    ]
  },
  {
    id: "neck_pain_stiffness",
    label: "Neck Pain or Stiffness",
    dimensions: {
      onset: ["sudden", "gradual", "after injury"],
      location: ["back of neck", "sides of neck", "radiating to shoulders/arms"],
      character: ["stiff", "aching", "sharp with movement", "burning"],
      triggers: ["looking up/down", "turning head", "long periods at computer"]
    },
    redFlags: [
      "Fever and severe headache",
      "Weakness in arms or hands",
      "Numbness or tingling in extremities",
      "Loss of bladder/bowel control"
    ]
  },
  {
    id: "scalp_symptoms",
    label: "Scalp Tenderness or Sores",
    dimensions: {
      character: ["tender to touch", "itching", "burning", "visible sores/crusts"],
      location: ["localized patch", "entire scalp", "temples"]
    },
    redFlags: [
      "Tenderness at the temples (with headache/vision changes)",
      "Rapidly spreading rash",
      "Large, non-healing sores",
      "Sudden hair loss with inflammation"
    ]
  },
  {
    id: "facial_swelling",
    label: "Facial Swelling",
    dimensions: {
      location: ["around eyes", "cheeks", "lips", "entire face"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Difficulty breathing or swallowing",
      "Swelling of the tongue or throat",
      "Sudden onset after new medication/food"
    ]
  },
  {
    id: "thyroid_swelling",
    label: "Thyroid Area Swelling/Pain",
    dimensions: {
      location: ["front of neck", "lower neck"],
      associated: ["difficulty swallowing", "voice change", "fast heart rate"]
    },
    redFlags: [
      "Rapidly growing lump",
      "Hard, fixed lump",
      "Severe pain in the front of neck"
    ]
  },
  {
    id: "head_hoarseness",
    label: "Hoarseness (Voice changes)",
    dimensions: {
      duration: ["acute (days)", "chronic (weeks)"],
      triggers: ["shouting", "cold/flu", "smoking"]
    },
    redFlags: [
      "Lasting more than 3 weeks",
      "Difficulty breathing",
      "Lump in the neck"
    ]
  },
  {
    id: "head_dysphagia",
    label: "Difficulty Swallowing",
    dimensions: {
      type: ["solids", "liquids", "both"],
      location: ["high in throat", "behind breastbone"]
    },
    redFlags: [
      "Complete inability to swallow",
      "Weight loss",
      "Regurgitation of undigested food"
    ]
  },
  {
    id: "scalp_rash",
    label: "Scalp Rash/Lesions",
    dimensions: {
      character: ["scaling", "crusting", "oozing", "bumps"],
      associated: ["hair loss", "itching", "pain"]
    },
    redFlags: [
      "Pus drainage",
      "Fever with rash",
      "Rapidly spreading"
    ]
  },
  {
    id: "neck_spasm",
    label: "Neck Muscle Tightness/Spasm",
    dimensions: {
      location: ["sides of neck", "trapezius area"],
      triggers: ["stress", "poor posture", "sudden movement"]
    },
    redFlags: [
      "Inability to touch chin to chest",
      "Weakness in arms"
    ]
  },
  {
    id: "facial_flushing",
    label: "Facial Flushing",
    dimensions: {
      triggers: ["emotion", "heat", "alcohol", "spicy food"],
      associated: ["sweating", "racing heart"]
    },
    redFlags: [
      "Associated with hives or wheezing",
      "Persistent redness with visible blood vessels"
    ]
  }
];

export const EAR_MODELS: SymptomModel[] = [
    {
        id: "ear_pain",
        label: "Ear Pain (Otalgia)",
        dimensions: {
            location: ["outer ear", "inner ear", "behind the ear"],
            type: ["sharp", "dull", "throbbing", "stabbing"],
            severity: ["mild", "moderate", "severe"]
        },
        redFlags: [
            "High fever with severe pain",
            "Swelling behind the ear (Mastoiditis)",
            "Facial weakness or paralysis",
            "Sudden hearing loss"
        ]
    },
    {
        id: "hearing_loss_sudden",
        label: "Sudden Hearing Loss",
        dimensions: {
            affected_side: ["one ear", "both ears"],
            onset: ["instantaneous", "over a few hours"],
            associated_symptoms: ["vertigo", "tinnitus", "fullness"]
        },
        redFlags: [
            "Total loss of hearing in one ear",
            "Sudden loss after head trauma",
            "Associated neurological symptoms"
        ]
    },
    {
        id: "hearing_loss_gradual",
        label: "Gradual Hearing Loss",
        dimensions: {
            progression: ["slow", "moderate"],
            environment: ["noisy places", "quiet places"],
            clarity: ["muffled sounds", "difficulty understanding speech"]
        },
        redFlags: [
            "Progressive loss in only one ear",
            "Associated with balance problems",
            "Discharge from the ear"
        ]
    },
    {
        id: "tinnitus",
        label: "Ringing in Ears (Tinnitus)",
        dimensions: {
            sound_type: ["ringing", "buzzing", "hissing", "roaring"],
            frequency: ["constant", "intermittent"],
            severity: ["mildly annoying", "disturbing sleep", "debilitating"]
        },
        redFlags: [
            "Pulsatile tinnitus (rhythmic with heartbeat)",
            "Tinnitus in only one ear",
            "Associated with sudden hearing loss"
        ]
    },
    {
        id: "ear_discharge_fluid",
        label: "Ear Discharge (Fluid/Pus)",
        dimensions: {
            appearance: ["clear", "yellow", "green", "cloudy"],
            odor: ["foul smelling", "odorless"],
            consistency: ["thin/watery", "thick/sticky"]
        },
        redFlags: [
            "Discharge after head injury",
            "Foul-smelling discharge with fever",
            "Chronic discharge that doesn't resolve"
        ]
    },
    {
        id: "ear_discharge_blood",
        label: "Bloody Ear Discharge",
        dimensions: {
            amount: ["spotting", "significant bleeding"],
            trigger: ["after trauma", "spontaneous", "after cleaning ear"]
        },
        redFlags: [
            "Bleeding after head trauma (skull fracture risk)",
            "Bleeding associated with severe pain",
            "Sudden bleeding with hearing loss"
        ]
    },
    {
        id: "ear_fullness",
        label: "Ear Pressure or Fullness",
        dimensions: {
            sensation: ["clogged feeling", "pressure like being on a plane"],
            timing: ["constant", "comes and goes"],
            triggers: ["after swimming", "during a cold", "altitude changes"]
        },
        redFlags: [
            "Persistent fullness in one ear",
            "Associated with dizziness or vertigo",
            "Sudden onset with hearing loss"
        ]
    },
    {
        id: "vertigo",
        label: "Dizziness or Vertigo",
        dimensions: {
            sensation: ["spinning", "lightheadedness", "unsteadiness"],
            triggers: ["moving head", "standing up", "spontaneous"],
            duration: ["seconds", "minutes", "hours", "days"]
        },
        redFlags: [
            "Vertical nystagmus (eyes moving up/down)",
            "Unable to walk or stand",
            "Associated with double vision or slurred speech"
        ]
    },
    {
        id: "ear_itching",
        label: "Itchy Ear Canal",
        dimensions: {
            severity: ["mild", "intense"],
            location: ["deep inside", "outer canal"],
            triggers: ["after swimming", "using hearing aids", "dry skin"]
        },
        redFlags: [
            "Itching with severe pain when touching the outer ear",
            "Swelling that closes the ear canal",
            "Spreading redness to the face"
        ]
    },
    {
        id: "hyperacusis",
        label: "Sensitivity to Loud Noises",
        dimensions: {
            severity: ["mild discomfort", "painful"],
            sounds: ["all loud noises", "specific frequencies"],
            impact: ["avoids social situations", "wears earplugs"]
        },
        redFlags: [
            "Sudden onset after trauma",
            "Associated with facial nerve weakness",
            "Rapidly worsening sensitivity"
        ]
    },
    {
        id: "ear_redness",
        label: "Redness of the Outer Ear",
        dimensions: {
            location: ["earlobe", "cartilage part", "whole ear"],
            temperature: ["hot to touch", "normal"],
            appearance: ["bright red", "pinkish"]
        },
        redFlags: [
            "Redness, swelling, and severe pain of the cartilage (Perichondritis)",
            "Spreading redness to the cheek",
            "Fever and chills"
        ]
    },
    {
        id: "ear_swelling",
        label: "Swelling of the Ear",
        dimensions: {
            location: ["behind the ear", "ear canal", "outer ear"],
            onset: ["sudden", "gradual"],
            firmness: ["soft/fluctuant", "hard/firm"]
        },
        redFlags: [
            "Swelling behind the ear pushing the ear forward (Mastoiditis)",
            "Swelling that blocks the ear canal completely",
            "Rapidly expanding swelling after trauma"
        ]
    }
];

export const EYE_MODELS: SymptomModel[] = [
  {
    id: "vision_blurring",
    label: "Blurred Vision",
    dimensions: {
      onset: ["sudden", "gradual"],
      eye: ["one eye", "both eyes"],
      severity: ["mild", "moderate", "severe"]
    },
    redFlags: [
      "Sudden loss of vision",
      "Pain with eye movement",
      "Seeing flashes or floaters",
      "Associated headache or nausea"
    ]
  },
  {
    id: "eye_pain",
    label: "Eye Pain",
    dimensions: {
      location: ["on surface", "behind eye", "deep ache"],
      character: ["sharp", "gritty", "throbbing"],
      triggers: ["light", "eye movement", "touch"]
    },
    redFlags: [
      "Severe pain with nausea/vomiting",
      "Pain after chemical exposure",
      "Inability to keep eye open"
    ]
  },
  {
    id: "eye_redness",
    label: "Redness (Bloodshot eyes)",
    dimensions: {
      pattern: ["localized spot", "generalized redness"],
      onset: ["sudden", "gradual"],
      eye: ["one eye", "both eyes"]
    },
    redFlags: [
      "Pain associated with redness",
      "Vision changes with redness",
      "History of recent eye surgery"
    ]
  },
  {
    id: "eye_itching",
    label: "Itching/Burning",
    dimensions: {
      timing: ["seasonal", "constant", "after screen use"],
      triggers: ["allergens", "contact lenses", "wind/smoke"]
    },
    redFlags: [
      "Yellow or green discharge",
      "Severe eyelid swelling"
    ]
  },
  {
    id: "dry_eyes",
    label: "Dry Eyes",
    dimensions: {
      character: ["stinging", "sandy feeling", "fatigued"],
      timing: ["worse at night", "worse in morning"]
    },
    redFlags: [
      "Associated dry mouth/joint pain",
      "Inability to produce any tears"
    ]
  },
  {
    id: "watery_eyes",
    label: "Excessive Tearing",
    dimensions: {
      triggers: ["cold air", "reading", "irritants"],
      eye: ["one eye", "both eyes"]
    },
    redFlags: [
      "Painful lump near tear duct",
      "Blood-tinged tears"
    ]
  },
  {
    id: "photophobia",
    label: "Light Sensitivity",
    dimensions: {
      severity: ["mild discomfort", "need to wear sunglasses indoors"],
      onset: ["sudden", "chronic"]
    },
    redFlags: [
      "Associated with stiff neck and fever",
      "Severe pain when light hits eye"
    ]
  },
  {
    id: "double_vision",
    label: "Double Vision (Diplopia)",
    dimensions: {
      type: ["horizontal", "vertical"],
      condition: ["persists when one eye closed", "goes away when one eye closed"]
    },
    redFlags: [
      "Sudden onset double vision",
      "Associated weakness or slurred speech",
      "New pupil size difference"
    ]
  },
  {
    id: "eye_flashes",
    label: "Flashes of Light",
    dimensions: {
      character: ["streaks", "lightning bolts", "stars"],
      frequency: ["occasional", "frequent"]
    },
    redFlags: [
      "Sudden increase in frequency",
      "Associated with 'curtain' over vision",
      "Recent eye trauma"
    ]
  },
  {
    id: "eye_floaters",
    label: "Floaters (Spots/Webs)",
    dimensions: {
      character: ["black dots", "cobwebs", "shadows"],
      movement: ["follows eye movement"]
    },
    redFlags: [
      "Shower of many new floaters",
      "Flashes of light with floaters"
    ]
  },
  {
    id: "eye_discharge",
    label: "Eye Discharge",
    dimensions: {
      color: ["clear/watery", "yellow", "green", "white"],
      consistency: ["sticky", "crusty", "thick"]
    },
    redFlags: [
      "Severe pain",
      "Lids stuck together in morning",
      "Reduced vision"
    ]
  }
];

export const THROAT_MODELS: SymptomModel[] = [
    {
        id: "sore_throat",
        label: "Sore Throat",
        dimensions: {
            severity: ["mild", "moderate", "severe"],
            onset: ["sudden", "gradual"],
            triggers: ["swallowing", "talking", "morning only"]
        },
        redFlags: [
            "Difficulty breathing or swallowing saliva",
            "Drooling (inability to swallow)",
            "Muffled 'hot potato' voice",
            "Visible swelling of the neck or airway"
        ]
    },
    {
        id: "throat_dysphagia",
        label: "Difficulty Swallowing (Dysphagia)",
        dimensions: {
            type: ["solids", "liquids", "both"],
            location: ["high in throat", "behind breastbone"],
            frequency: ["intermittent", "progressive/worsening"]
        },
        redFlags: [
            "Total inability to swallow",
            "Weight loss with swallowing difficulty",
            "Regurgitation of undigested food",
            "Painful swallowing"
        ]
    },
    {
        id: "odynophagia",
        label: "Painful Swallowing (Odynophagia)",
        dimensions: {
            severity: ["mild", "sharp/stabbing", "intense"],
            location: ["one side", "both sides"],
            triggers: ["swallowing saliva", "swallowing food"]
        },
        redFlags: [
            "Severe pain preventing any oral intake",
            "Associated with high fever and chills",
            "Unilateral (one-sided) severe pain"
        ]
    },
    {
        id: "throat_hoarseness",
        label: "Hoarseness or Voice Change",
        dimensions: {
            duration: ["under 2 weeks", "over 2 weeks"],
            quality: ["raspy", "breathy", "strained", "weak"],
            timing: ["worse at end of day", "worse in morning"]
        },
        redFlags: [
            "Hoarseness lasting more than 3 weeks (especially in smokers)",
            "Difficulty breathing (Stridor)",
            "Lump in the neck"
        ]
    },
    {
        id: "globus_sensation",
        label: "Lump in Throat Sensation",
        dimensions: {
            feeling: ["stuck object", "tightness", "mucus clearing"],
            relation_to_meals: ["better while eating", "worse after eating"],
            triggers: ["stress/anxiety", "acid reflux"]
        },
        redFlags: [
            "Actual difficulty swallowing food",
            "Pain associated with the sensation",
            "Weight loss"
        ]
    },
    {
        id: "frequent_throat_clearing",
        label: "Frequent Throat Clearing",
        dimensions: {
            triggers: ["after eating", "when lying down", "constant"],
            associated_symptoms: ["mucus sensation", "tickle in throat"]
        },
        redFlags: [
            "Associated with chronic cough",
            "Change in voice quality",
            "Feeling of food getting stuck"
        ]
    },
    {
        id: "throat_dryness",
        label: "Throat Dryness",
        dimensions: {
            severity: ["mildly scratchy", "very dry/parched"],
            timing: ["morning", "night", "constant"],
            triggers: ["mouth breathing", "dry air", "dehydration"]
        },
        redFlags: [
            "Dryness associated with severe thirst (Diabetes risk)",
            "Associated with dry eyes and dry mouth (Sjogren's risk)",
            "Inability to produce saliva"
        ]
    },
    {
        id: "throat_itching",
        label: "Throat Itching or Tickle",
        dimensions: {
            triggers: ["allergens", "cold air", "talking"],
            severity: ["mild irritation", "triggers coughing fits"]
        },
        redFlags: [
            "Rapid onset with lip or tongue swelling (Anaphylaxis risk)",
            "Associated with wheezing or shortness of breath",
            "Hives or rash"
        ]
    },
    {
        id: "swollen_neck_glands",
        label: "Swollen Glands in Neck",
        dimensions: {
            location: ["under jaw", "side of neck", "back of neck"],
            consistency: ["soft/tender", "hard/painless"],
            mobility: ["moves easily", "fixed/stuck"]
        },
        redFlags: [
            "Hard, painless, and fixed lump",
            "Rapidly growing lump",
            "Night sweats and unexplained weight loss"
        ]
    },
    {
        id: "bad_breath",
        label: "Bad Breath (Halitosis)",
        dimensions: {
            onset: ["recent", "chronic"],
            associated_symptoms: ["bad taste in mouth", "white spots on tonsils"]
        },
        redFlags: [
            "Fecal odor (bowel obstruction risk)",
            "Fruity odor (Diabetic ketoacidosis risk)",
            "Ammonia-like odor (Kidney issue risk)"
        ]
    }
];

export const BACK_MODELS: SymptomModel[] = [
  {
    id: "back_pain_lower",
    label: "Lower Back Pain",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["sharp", "dull ache", "radiating to leg"],
      triggers: ["lifting", "sitting", "standing"]
    },
    redFlags: [
      "Loss of bladder or bowel control",
      "Numbness in saddle area",
      "Fever with back pain",
      "History of cancer"
    ]
  },
  {
    id: "back_pain_upper",
    label: "Upper Back Pain",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["sharp", "muscle knot", "burning"],
      triggers: ["posture", "reaching", "deep breathing"]
    },
    redFlags: [
      "Pain radiating around chest",
      "Fever or night sweats",
      "New weakness in legs"
    ]
  },
  {
    id: "neck_pain",
    label: "Neck Pain (Cervical Pain)",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["stiff", "sharp", "radiating to arms"],
      triggers: ["screen use", "sleeping position", "movement"]
    },
    redFlags: [
      "Severe headache",
      "Weakness in hands or arms",
      "Shooting pains into fingers"
    ]
  },
  {
    id: "mid_back_pain",
    label: "Mid-Back Pain (Thoracic)",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["dull ache", "localized", "stiffness"],
      triggers: ["twisting", "sitting long periods"]
    },
    redFlags: [
      "Pain following trauma",
      "Severe localized tenderness",
      "Difficulty breathing due to pain"
    ]
  },
  {
    id: "sciatica",
    label: "Sciatica (Leg Pain)",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["shooting", "electric shock", "burning"],
      location: ["buttock", "thigh", "calf", "foot"]
    },
    redFlags: [
      "Severe leg weakness",
      "Foot drop (cannot lift foot)",
      "Bilateral leg pain"
    ]
  },
  {
    id: "back_spasm",
    label: "Back Muscle Spasm",
    dimensions: {
      onset: ["sudden"],
      character: ["intense contraction", "locking"],
      triggers: ["sudden movement", "heavy lifting"]
    },
    redFlags: [
      "Inability to move",
      "Intense pain that doesn't settle"
    ]
  },
  {
    id: "back_stiffness",
    label: "Back Stiffness",
    dimensions: {
      timing: ["morning", "after sitting", "end of day"],
      duration: ["minutes", "hours"],
      relief: ["movement", "warmth"]
    },
    redFlags: [
      "Stiffness lasting > 1 hour in morning",
      "Associated joint swelling"
    ]
  },
  {
    id: "back_numbness",
    label: "Numbness/Tingling",
    dimensions: {
      location: ["back", "buttocks", "legs", "feet"],
      pattern: ["constant", "intermittent"],
      triggers: ["certain positions"]
    },
    redFlags: [
      "Saddle anesthesia (numbness in groin)",
      "Progressive loss of sensation"
    ]
  }
];

export const LUNGS_MODELS: SymptomModel[] = [
  {
    id: "cough_dry",
    label: "Dry Cough",
    dimensions: {
      onset: ["sudden", "gradual"],
      duration: ["acute (<3 weeks)", "chronic (>8 weeks)"],
      triggers: ["cold air", "exercise", "lying down"]
    },
    redFlags: [
      "Coughing up blood",
      "Shortness of breath",
      "Unexplained weight loss"
    ]
  },
  {
    id: "lungs_shortness_of_breath",
    label: "Shortness of Breath",
    dimensions: {
      onset: ["sudden (Emergency!)", "gradual"],
      triggers: ["exertion", "at rest", "lying flat", "allergic trigger"],
      severity: ["cannot speak full sentences", "worse with activity", "mild"]
    },
    redFlags: [
      "Bluish tint to lips/nails (Emergency)",
      "Inability to speak in full sentences",
      "Severe chest pain",
      "Stridor (high-pitched breathing sound)"
    ]
  },
  {
    id: "cough_productive",
    label: "Wet/Productive Cough",
    dimensions: {
      sputum_color: ["clear/white", "yellow/green", "rusty/brown", "pink/frothy"],
      duration: ["acute", "chronic"]
    },
    redFlags: [
      "Rusty or blood-streaked phlegm",
      "Pink, frothy phlegm",
      "High fever and chills"
    ]
  },
  {
    id: "wheezing",
    label: "Wheezing (Whistling sound)",
    dimensions: {
      timing: ["breathing in", "breathing out", "both"],
      triggers: ["allergens", "cold air", "exercise", "at night"]
    },
    redFlags: [
      "Severe difficulty breathing",
      "Silent chest (no air moving)",
      "Associated with hives or lip swelling"
    ]
  },
  {
    id: "pleuritic_chest_pain",
    label: "Pain when Breathing",
    dimensions: {
      character: ["sharp", "stabbing"],
      triggers: ["deep breath", "coughing", "sneezing"]
    },
    redFlags: [
      "Sudden sharp pain with shortness of breath",
      "Fever and productive cough",
      "Recent leg surgery or long travel"
    ]
  },
  {
    id: "tachypnea",
    label: "Rapid Breathing",
    dimensions: {
      onset: ["sudden", "gradual"],
      context: ["at rest", "after light activity"]
    },
    redFlags: [
      "Cannot speak in full sentences",
      "Rate > 30 breaths per minute",
      "Confusion or lethargy"
    ]
  },
  {
    id: "hemoptysis",
    label: "Coughing up Blood",
    dimensions: {
      amount: ["streaks", "teaspoons", "large amounts"],
      frequency: ["once", "repeatedly"]
    },
    redFlags: [
      "Large volume of blood (Emergency)",
      "Weight loss and night sweats",
      "History of smoking or cancer"
    ]
  },
  {
    id: "chest_tightness",
    label: "Chest Tightness",
    dimensions: {
      timing: ["constant", "intermittent", "with exercise"],
      character: ["band-like", "heavy weight", "squeezing"]
    },
    redFlags: [
      "Radiating to arm or jaw",
      "Associated with severe shortness of breath",
      "Not relieved by rest"
    ]
  },
  {
    id: "sleep_apnea",
    label: "Snoring / Sleep Apnea",
    dimensions: {
      character: ["loud snoring", "gasping/choking", "silent pauses"],
      associated: ["daytime sleepiness", "morning headaches"]
    },
    redFlags: [
      "Observed stopping breathing during sleep",
      "Falling asleep while driving"
    ]
  }
];

export const HEART_MODELS: SymptomModel[] = [
  {
    id: "heart_chest_pain",
    label: "Chest Pain or Pressure",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["heavy pressure", "sharp", "stabbing", "burning"],
      location: ["center of chest", "left side", "radiating to arm/jaw"]
    },
    redFlags: [
      "Pain radiating to jaw, neck, or left arm",
      "Sweating and nausea (cold sweat)",
      "Shortness of breath",
      "Pain lasting more than 15 minutes"
    ]
  },
  {
    id: "palpitations",
    label: "Palpitations (Racing Heart)",
    dimensions: {
      character: ["fluttering", "skipping beats", "pounding", "racing"],
      triggers: ["stress", "caffeine", "exercise", "at rest"]
    },
    redFlags: [
      "Associated fainting or near-fainting",
      "Chest pain with palpitations",
      "Severe shortness of breath"
    ]
  },
  {
    id: "heart_shortness_of_breath_exertion",
    label: "Shortness of Breath (on movement)",
    dimensions: {
      severity: ["after stairs", "after walking flat", "minimal movement"],
      onset: ["recent change", "gradual worsening"]
    },
    redFlags: [
      "Rapidly decreasing exercise tolerance",
      "Chest tightness",
      "Associated leg swelling"
    ]
  },
  {
    id: "heart_shortness_of_breath_rest",
    label: "Shortness of Breath (at rest)",
    dimensions: {
      onset: ["sudden", "gradual"],
      position: ["worse lying flat", "need to prop up on pillows"]
    },
    redFlags: [
      "Waking up at night gasping for air (PND)",
      "Bluish tint to lips or nails",
      "Inability to speak in full sentences"
    ]
  },
  {
    id: "leg_swelling_heart",
    label: "Swelling in Legs/Ankles",
    dimensions: {
      location: ["both legs", "one leg only"],
      timing: ["worse at end of day", "constant"]
    },
    redFlags: [
      "Sudden onset in one leg with pain (DVT concern)",
      "Swelling reaching the thighs or abdomen",
      "Associated shortness of breath"
    ]
  },
  {
    id: "heart_fainting_syncope",
    label: "Fainting (Syncope)",
    dimensions: {
      triggers: ["standing up", "during exercise", "emotional stress"],
      warning_signs: ["tunnel vision", "nausea", "sweating", "none"]
    },
    redFlags: [
      "Fainting during physical activity",
      "Fainting without any warning",
      "Associated chest pain or palpitations"
    ]
  },
  {
    id: "cyanosis",
    label: "Cyanosis (Blue Lips/Skin)",
    dimensions: {
      location: ["lips", "fingertips", "toes", "generalized"],
      onset: ["sudden", "gradual", "with cold"]
    },
    redFlags: [
      "Sudden onset with shortness of breath",
      "Central cyanosis (lips/tongue)",
      "Associated with chest pain"
    ]
  },
  {
    id: "orthopnea",
    label: "Difficulty Breathing Lying Down",
    dimensions: {
      severity: ["needs 2 pillows", "needs to sit upright", "wakes up gasping"]
    },
    redFlags: [
      "Waking up gasping for air (PND)",
      "Associated with severe leg swelling",
      "Pink frothy sputum"
    ]
  }
];

export const DIGESTIVE_MODELS: SymptomModel[] = [
  {
    id: "abdominal_pain",
    label: "Abdominal Pain",
    dimensions: {
      onset: ["sudden", "gradual"],
      location: ["upper right", "upper left", "lower right", "lower left", "generalized"],
      character: ["crampy", "sharp", "dull ache"]
    },
    redFlags: [
      "Rigid, board-like abdomen",
      "Fever and vomiting",
      "Bloody stools"
    ]
  },
  {
    id: "heartburn_reflux",
    label: "Heartburn / Acid Reflux",
    dimensions: {
      timing: ["after meals", "at night", "when lying down"],
      associated: ["sour taste", "coughing", "chest pain"]
    },
    redFlags: [
      "Difficulty swallowing",
      "Pain when swallowing",
      "Unexplained weight loss"
    ]
  },
  {
    id: "nausea",
    label: "Nausea",
    dimensions: {
      timing: ["morning", "after eating", "constant"],
      triggers: ["smells", "movement", "food"]
    },
    redFlags: [
      "Associated severe headache",
      "Confusion",
      "Unable to keep fluids down"
    ]
  },
  {
    id: "vomiting",
    label: "Vomiting",
    dimensions: {
      content: ["food", "bile (yellow/green)", "blood", "coffee grounds"],
      frequency: ["once", "multiple times"]
    },
    redFlags: [
      "Vomiting blood or coffee ground material",
      "Severe abdominal pain",
      "Signs of dehydration"
    ]
  },
  {
    id: "diarrhea",
    label: "Diarrhea",
    dimensions: {
      consistency: ["loose", "watery", "bloody", "mucus"],
      duration: ["acute (<2 weeks)", "chronic (>4 weeks)"]
    },
    redFlags: [
      "Bloody diarrhea",
      "High fever (>102°F)",
      "Severe dehydration"
    ]
  },
  {
    id: "constipation",
    label: "Constipation",
    dimensions: {
      duration: ["recent change", "long-term"],
      character: ["hard/dry stools", "straining", "incomplete evacuation"]
    },
    redFlags: [
      "Sudden change in bowel habits (>50 years old)",
      "Rectal bleeding",
      "Thin, pencil-like stools"
    ]
  },
  {
    id: "bloating_gas",
    label: "Bloating / Excessive Gas",
    dimensions: {
      timing: ["after meals", "constant", "worse at end of day"],
      associated: ["belching", "flatulence", "abdominal distension"]
    },
    redFlags: [
      "Severe abdominal pain",
      "Unexplained weight loss",
      "Blood in stool"
    ]
  },
  {
    id: "blood_in_stool",
    label: "Blood in Stool",
    dimensions: {
      color: ["bright red", "dark red/maroon", "black/tarry"],
      amount: ["streaks on paper", "mixed in stool", "large amounts"]
    },
    redFlags: [
      "Large volume of blood",
      "Associated dizziness or fainting",
      "Severe abdominal pain"
    ]
  },
  {
    id: "jaundice",
    label: "Jaundice (Yellowing of Skin/Eyes)",
    dimensions: {
      onset: ["sudden", "gradual"],
      associated: ["dark urine", "pale stools", "itching"]
    },
    redFlags: [
      "Severe abdominal pain",
      "High fever",
      "Confusion or extreme sleepiness"
    ]
  },
  {
    id: "loss_of_appetite",
    label: "Loss of Appetite",
    dimensions: {
      duration: ["days", "weeks", "months"],
      associated: ["nausea", "early satiety (feeling full quickly)", "weight loss"]
    },
    redFlags: [
      "Significant unintentional weight loss",
      "Difficulty swallowing",
      "Severe abdominal pain"
    ]
  },
  {
    id: "belching_hiccups",
    label: "Persistent Belching / Hiccups",
    dimensions: {
      duration: ["hours", "days", "weeks"],
      associated: ["heartburn", "chest pain", "abdominal bloating"]
    },
    redFlags: [
      "Hiccups lasting more than 48 hours",
      "Associated with severe chest/abdominal pain",
      "Difficulty swallowing"
    ]
  }
];

export const KIDNEY_MODELS: SymptomModel[] = [
  {
    id: "painful_urination",
    label: "Painful Urination",
    dimensions: {
      onset: ["sudden", "gradual"],
      frequency: ["increased", "normal"],
      associated: ["blood in urine", "fever", "back pain"]
    },
    redFlags: [
      "High fever and back pain",
      "Inability to urinate",
      "Visible blood in urine"
    ]
  },
  {
    id: "hematuria",
    label: "Blood in Urine",
    dimensions: {
      color: ["pink", "red", "cola-colored"],
      timing: ["beginning of stream", "end of stream", "throughout"]
    },
    redFlags: [
      "Painless bleeding (Risk of cancer)",
      "Large clots in urine",
      "Associated severe flank pain"
    ]
  },
  {
    id: "nycturia",
    label: "Frequent Night Urination",
    dimensions: {
      frequency: ["1-2 times", "3+ times", "hourly"],
      onset: ["recent change", "long-standing"]
    },
    redFlags: [
      "Sudden increase in frequency",
      "Excessive thirst",
      "Leg swelling"
    ]
  },
  {
    id: "urinary_urgency",
    label: "Urgent Urination",
    dimensions: {
      character: ["sudden strong need", "fear of leaking"]
    },
    redFlags: [
      "Associated with fever and chills",
      "New onset in elderly (Risk of UTI/delirium)",
      "Blood in urine"
    ]
  },
  {
    id: "hesitancy",
    label: "Difficulty Starting Urination",
    dimensions: {
      severity: ["mild delay", "significant straining needed"]
    },
    redFlags: [
      "Complete inability to urinate",
      "Associated lower back pain",
      "Weakness in legs"
    ]
  },
  {
    id: "flank_pain",
    label: "Flank Pain (Kidney Area)",
    dimensions: {
      character: ["sharp/colicky", "dull ache", "throbbing"],
      location: ["one side", "both sides", "radiating to groin"]
    },
    redFlags: [
      "Severe, unbearable pain",
      "Associated fever and chills",
      "Inability to urinate"
    ]
  },
  {
    id: "urinary_incontinence",
    label: "Urinary Incontinence",
    dimensions: {
      type: ["stress (coughing/sneezing)", "urge", "overflow"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Associated with leg weakness",
      "Numbness in the saddle area",
      "Sudden onset with confusion"
    ]
  },
  {
    id: "cloudy_foul_urine",
    label: "Cloudy or Foul-Smelling Urine",
    dimensions: {
      appearance: ["cloudy", "milky", "dark"],
      odor: ["strong ammonia", "foul/sweet", "fishy"]
    },
    redFlags: [
      "Associated with high fever and chills",
      "Severe flank or back pain",
      "Confusion (especially in elderly)"
    ]
  },
  {
    id: "oliguria",
    label: "Decreased Urine Output",
    dimensions: {
      severity: ["noticeably less", "very little", "none at all"],
      associated: ["swelling in legs", "shortness of breath", "confusion"]
    },
    redFlags: [
      "No urine output for over 12 hours",
      "Associated with severe dehydration",
      "Shortness of breath and generalized swelling"
    ]
  }
];

export const SKIN_MODELS: SymptomModel[] = [
    {
        id: "skin_rash",
        label: "Skin Rash",
        dimensions: {
            location: ["face", "trunk", "limbs", "generalized"],
            appearance: ["flat", "raised", "bumpy", "scaly"],
            severity: ["mild", "moderate", "severe"]
        },
        redFlags: [
            "Rash that does not blanch (turn white) under pressure",
            "Rash with high fever and joint pain",
            "Rapidly spreading purple spots (Purpura)",
            "Rash with difficulty breathing or lip swelling"
        ]
    },
    {
        id: "skin_itching",
        label: "Itching (Pruritus)",
        dimensions: {
            location: ["localized", "widespread"],
            timing: ["worse at night", "after showering", "constant"],
            triggers: ["new soap/detergent", "stress", "heat"]
        },
        redFlags: [
            "Itching associated with yellowing of skin or eyes (Jaundice)",
            "Widespread itching without a rash",
            "Itching with weight loss or night sweats"
        ]
    },
    {
        id: "skin_redness",
        label: "Skin Redness (Erythema)",
        dimensions: {
            location: ["localized", "spreading"],
            temperature: ["warm to touch", "normal"],
            appearance: ["bright red", "faint pink", "circular/ring-like"]
        },
        redFlags: [
            "Redness that is rapidly spreading",
            "Redness with severe pain and fever (Cellulitis risk)",
            "Bull's-eye shaped rash (Lyme disease risk)"
        ]
    },
    {
        id: "skin_lesion_changes",
        label: "Mole / Skin Lesion Changes",
        dimensions: {
            change_type: ["size", "color", "shape", "bleeding"],
            appearance: ["asymmetrical", "irregular borders", "multiple colors"]
        },
        redFlags: [
            "Rapid growth",
            "Bleeding or oozing",
            "Diameter larger than a pencil eraser (6mm)"
        ]
    },
    {
        id: "hives_urticaria",
        label: "Hives (Urticaria)",
        dimensions: {
            appearance: ["raised welts", "red", "itchy"],
            onset: ["sudden", "chronic"]
        },
        redFlags: [
            "Swelling of the lips, tongue, or throat",
            "Difficulty breathing or swallowing",
            "Feeling faint or dizzy"
        ]
    },
    {
        id: "skin_bruising",
        label: "Easy Bruising",
        dimensions: {
            location: ["limbs", "trunk", "unexplained"],
            frequency: ["occasional", "frequent"]
        },
        redFlags: [
            "Bruising without trauma",
            "Associated with bleeding gums or nosebleeds",
            "Petechiae (tiny red/purple dots on skin)"
        ]
    }
];

export const MUSCULOSKELETAL_MODELS: SymptomModel[] = [
  {
    id: "msk_joint_pain",
    label: "Joint Pain",
    dimensions: {
      location: ["knee", "shoulder", "hip", "wrist", "fingers", "multiple"],
      character: ["aching", "sharp", "stiff", "throbbing"],
      timing: ["worse in morning", "worse with activity", "constant"],
      severity: ["mild", "moderate", "severe"]
    },
    redFlags: [
      "Hot, swollen, red joint",
      "Inability to bear weight",
      "Associated fever",
      "Sudden onset of severe pain"
    ]
  },
  {
    id: "msk_muscle_weakness",
    label: "Muscle Weakness",
    dimensions: {
      location: ["arms", "legs", "one side", "generalized"],
      onset: ["sudden", "gradual"],
      associated: ["numbness", "pain", "fatigue"]
    },
    redFlags: [
      "Sudden weakness on one side",
      "Progressive weakness over days",
      "Difficulty breathing or swallowing"
    ]
  },
  {
    id: "msk_joint_swelling",
    label: "Joint Swelling",
    dimensions: {
      location: ["single joint", "multiple joints", "symmetrical"],
      onset: ["after injury", "spontaneous", "gradual"]
    },
    redFlags: [
      "Joint is hot and red",
      "Associated high fever",
      "Inability to move the joint"
    ]
  },
  {
    id: "msk_muscle_cramps",
    label: "Muscle Cramps / Spasms",
    dimensions: {
      location: ["calves", "thighs", "feet", "back"],
      timing: ["at night", "during exercise", "at rest"]
    },
    redFlags: [
      "Severe, unrelenting spasm",
      "Associated with dark urine",
      "Significant muscle weakness"
    ]
  },
  {
    id: "msk_bone_pain",
    label: "Bone Pain",
    dimensions: {
      character: ["deep ache", "sharp", "worse at night"],
      location: ["long bones", "spine", "ribs"]
    },
    redFlags: [
      "Pain waking patient from sleep",
      "Unexplained weight loss",
      "History of cancer"
    ]
  },
  {
    id: "joint_stiffness",
    label: "Joint Stiffness",
    dimensions: {
      timing: ["morning", "after resting", "constant"],
      duration: ["less than 30 mins", "more than 1 hour"],
      location: ["hands", "knees", "spine", "multiple"]
    },
    redFlags: [
      "Morning stiffness lasting > 1 hour",
      "Associated with hot, swollen joints",
      "Systemic symptoms like fever or fatigue"
    ]
  },
  {
    id: "gait_abnormality",
    label: "Gait Abnormality / Limping",
    dimensions: {
      character: ["shuffling", "unsteady/wobbly", "limping due to pain"],
      onset: ["sudden", "gradual progressive"]
    },
    redFlags: [
      "Sudden inability to walk",
      "Associated with new weakness or numbness",
      "Frequent falls"
    ]
  }
];

export const NEUROLOGICAL_MODELS: SymptomModel[] = [
  {
    id: "neuro_numbness",
    label: "Numbness or Tingling",
    dimensions: {
      location: ["hands", "feet", "one side of body", "face"],
      pattern: ["glove and stocking", "dermatomal", "patchy"],
      duration: ["intermittent", "constant", "progressive"]
    },
    redFlags: [
      "Sudden onset on one side",
      "Associated with weakness",
      "Loss of bowel/bladder control",
      "Saddle anesthesia"
    ]
  },
  {
    id: "neuro_tremor",
    label: "Tremor",
    dimensions: {
      type: ["resting", "action", "postural"],
      location: ["hands", "head", "voice", "legs"],
      severity: ["mild", "interferes with daily activities"]
    },
    redFlags: [
      "Sudden onset",
      "Associated with altered mental status",
      "Rapid progression"
    ]
  },
  {
    id: "neuro_seizures",
    label: "Seizures / Convulsions",
    dimensions: {
      type: ["full body shaking", "staring spells", "focal twitching"],
      associated: ["loss of consciousness", "loss of bowel/bladder control", "confusion afterwards"]
    },
    redFlags: [
      "First ever seizure",
      "Seizure lasting longer than 5 minutes",
      "Difficulty breathing after seizure",
      "Repeated seizures without waking up"
    ]
  },
  {
    id: "neuro_memory_loss",
    label: "Memory Loss / Confusion",
    dimensions: {
      onset: ["sudden", "gradual"],
      type: ["short-term memory", "long-term memory", "getting lost"],
      progression: ["stable", "worsening"]
    },
    redFlags: [
      "Sudden onset of confusion or delirium",
      "Associated with fever or headache",
      "Following a head injury"
    ]
  },
  {
    id: "neuro_speech_difficulty",
    label: "Speech Difficulty",
    dimensions: {
      type: ["slurred speech", "finding words", "understanding speech"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Sudden onset (Stroke concern)",
      "Associated with facial droop or weakness",
      "Inability to speak at all"
    ]
  },
  {
    id: "neuro_coordination",
    label: "Coordination / Balance Problems",
    dimensions: {
      type: ["stumbling", "clumsiness", "vertigo"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Sudden inability to walk",
      "Associated with severe headache or vomiting",
      "Weakness on one side of the body"
    ]
  },
  {
    id: "paralysis",
    label: "Paralysis / Loss of Movement",
    dimensions: {
      location: ["one side of body", "lower half", "single limb", "face"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Sudden onset (Emergency)",
      "Associated with loss of bowel/bladder control",
      "Difficulty breathing or swallowing"
    ]
  },
  {
    id: "neuropathic_pain",
    label: "Nerve Pain (Neuropathy)",
    dimensions: {
      character: ["burning", "shooting/electric", "stabbing"],
      location: ["feet/hands", "radiating down leg/arm", "face"]
    },
    redFlags: [
      "Rapidly progressive weakness",
      "Loss of sensation to sharp objects",
      "Saddle anesthesia"
    ]
  }
];

export const GENERAL_MODELS: SymptomModel[] = [
  {
    id: "gen_fever",
    label: "Fever / Chills",
    dimensions: {
      severity: ["low-grade", "high (>103F/39.4C)", "fluctuating"],
      duration: ["few days", "more than a week", "constant"],
      associated: ["sweating", "shivering", "body aches"]
    },
    redFlags: [
      "Fever with stiff neck",
      "Fever with severe unexplained pain",
      "Fever in immunocompromised patient"
    ]
  },
  {
    id: "gen_fatigue",
    label: "Fatigue / Exhaustion",
    dimensions: {
      onset: ["sudden", "gradual"],
      severity: ["mild", "interferes with daily life", "bedbound"],
      relief: ["improves with rest", "unrelieved by sleep"]
    },
    redFlags: [
      "Associated with unexplained weight loss",
      "Associated with severe shortness of breath",
      "Sudden extreme fatigue"
    ]
  },
  {
    id: "gen_weight_loss",
    label: "Unintentional Weight Loss",
    dimensions: {
      amount: ["less than 5%", "5-10%", "more than 10% of body weight"],
      timeframe: ["over months", "rapid (weeks)"],
      appetite: ["normal/increased", "decreased"]
    },
    redFlags: [
      "Rapid, unexplained weight loss",
      "Associated with night sweats",
      "Associated with difficulty swallowing"
    ]
  },
  {
    id: "gen_night_sweats",
    label: "Night Sweats",
    dimensions: {
      severity: ["mild dampness", "drenching (need to change clothes)"],
      frequency: ["occasional", "every night"]
    },
    redFlags: [
      "Associated with weight loss and fever",
      "Drenching sweats persisting for weeks",
      "Associated with chronic cough"
    ]
  },
  {
    id: "gen_thirst",
    label: "Excessive Thirst (Polydipsia)",
    dimensions: {
      onset: ["sudden", "gradual"],
      associated: ["frequent urination", "dry mouth", "fatigue"]
    },
    redFlags: [
      "Associated with confusion or lethargy",
      "Sudden onset with high urine volume",
      "Fruity breath odor"
    ]
  }
];

export const ALL_MODELS: Record<string, SymptomModel[]> = {
  general: GENERAL_MODELS,
  head: HEAD_MODELS,
  ear: EAR_MODELS,
  eye: EYE_MODELS,
  throat: THROAT_MODELS,
  back: BACK_MODELS,
  lungs: LUNGS_MODELS,
  heart: HEART_MODELS,
  digestive: DIGESTIVE_MODELS,
  kidney: KIDNEY_MODELS,
  skin: SKIN_MODELS,
  musculoskeletal: MUSCULOSKELETAL_MODELS,
  neurological: NEUROLOGICAL_MODELS,
};
