export interface SymptomModel {
  id: string;
  label: string;
  dimensions?: Record<string, string[]>;
  redFlags?: string[];
  requiredExams?: string[];
}

export const HEAD_MODELS: SymptomModel[] = [
  {
    id: "headache_general",
    label: "Headache",
    dimensions: {
      onset: ["gradual", "sudden", "after injury"],
      location: ["entire head", "one side", "behind eyes", "base of skull"],
      character: ["throbbing", "dull ache", "stabbing", "shooting"],
      severity: ["mild", "moderate", "severe", "incapacitating"]
    },
    redFlags: [
      "Sudden 'thunderclap' onset",
      "Fever and neck stiffness",
      "Headache after trauma",
      "New headache after age 50",
      "Sudden change in pattern"
    ]
  },
  {
    id: "head_pressure",
    label: "Head Pressure",
    dimensions: {
      location: ["forehead", "behind eyes", "sides of head", "top of head"],
      triggers: ["bending over", "coughing/straining", "changes in weather"]
    },
    redFlags: [
      "Worse when lying flat",
      "Associated with vision changes",
      "Nausea and vomiting"
    ]
  },
  {
    id: "head_trauma",
    label: "Head Trauma / Injury",
    dimensions: {
      mechanism: ["fall", "blunt impact", "sports injury", "motor vehicle accident"],
      onset: ["immediate", "delayed symptom onset"],
      consciousness: ["loss of consciousness", "altered awareness", "no loss of consciousness"]
    },
    redFlags: [
      "Repeated vomiting",
      "Seizures",
      "Unequal pupil size",
      "Fluid/blood from ears or nose",
      "Increasingly severe headache"
    ],
    requiredExams: [
      "Assess GCS score",
      "Check pupil reactivity",
      "Perform neurological screening"
    ]
  },
  {
    id: "scalp_pain",
    label: "Scalp Pain / Tenderness",
    dimensions: {
      location: ["temples", "back of head", "patchy", "generalized"],
      character: ["tender to touch", "burning", "sharp", "aching"],
      triggers: ["brushing hair", "wearing hat/glasses"]
    },
    redFlags: [
      "Tenderness at the temples (Giant Cell Arteritis concern)",
      "Vision blurring or temporary loss",
      "Jaw claudication (pain when chewing)"
    ]
  },
  {
    id: "head_dizziness",
    label: "Dizziness (Head-related)",
    dimensions: {
      type: ["spinning (vertigo)", "lightheadedness", "faintness", "unsteadiness"],
      triggers: ["standing up", "turning head", "crowded environments", "stress"]
    },
    redFlags: [
      "Associated with chest pain",
      "Associated with slurred speech",
      "Sudden hearing loss",
      "Focal weakness"
    ]
  },
  {
    id: "headache_migraine",
    label: "Migraine Symptoms",
    dimensions: {
      phases: ["aura (visual/sensory)", "prodrome", "attack", "postdrome"],
      associated: ["nausea/vomiting", "light sensitivity", "sound sensitivity", "sensitivity to smells"],
      location: ["unilateral (one side)", "bilateral"],
      character: ["pulsating", "pounding", "throbbing"]
    },
    redFlags: [
      "First ever migraine-like aura",
      "Aura lasting > 60 minutes",
      "Weakness on one side"
    ]
  },
  {
    id: "headache_tension",
    label: "Tension Headache Features",
    dimensions: {
      location: ["forehead", "temples", "back of neck/head"],
      character: ["tight band", "squeezing", "heavy pressure", "non-pulsating"],
      triggers: ["stress", "poor posture", "hunger"]
    },
    redFlags: [
      "Doesn't respond to usual treatments",
      "Increasing frequency",
      "Associated with personality changes"
    ]
  },
  {
    id: "facial_pain",
    label: "Facial Pain",
    dimensions: {
      location: ["cheek", "jaw", "forehead", "around eye"],
      character: ["electric shock-like", "aching", "burning", "stabbing"],
      triggers: ["chewing", "talking", "cold wind", "touching face"]
    },
    redFlags: [
      "Pain with facial swelling",
      "Persistent numbness",
      "Weight loss"
    ]
  },
  {
    id: "facial_swelling",
    label: "Facial Swelling",
    dimensions: {
      location: ["eyes/eyelids", "lips", "cheeks", "one side", "both sides"],
      onset: ["sudden (minutes/hours)", "gradual (days)"]
    },
    redFlags: [
      "Swelling of tongue or throat",
      "Difficulty breathing",
      "Fever and severe pain"
    ]
  },
  {
    id: "facial_asymmetry",
    label: "Facial Asymmetry / Drooping",
    dimensions: {
      onset: ["sudden (Stroke concern)", "over days (Bell's palsy concern)"],
      location: ["lower face only", "entire one side (including forehead)"],
      associated: ["difficulty closing eye", "drooling", "slurred speech"]
    },
    redFlags: [
      "Associated arm/leg weakness",
      "Difficulty understanding speech",
      "Severe headache",
      "Vision changes"
    ]
  },
  {
    id: "jaw_pain_tmj",
    label: "Jaw / TMJ Pain",
    dimensions: {
      location: ["jaw joint", "radiating to ear", "temples"],
      character: ["clicking", "popping", "lockjaw", "grinding", "aching"],
      triggers: ["chewing", "yawning", "stress/clenching"]
    },
    redFlags: [
      "Inability to open mouth",
      "Severe swelling in the jaw area",
      "Jaw pain associated with chest pressure (Heart alert)"
    ]
  },
  {
    id: "facial_numbness",
    label: "Facial Numbness / Tingling",
    dimensions: {
      location: ["lips", "cheek", "one side", "patchy"],
      onset: ["sudden", "intermittent"]
    },
    redFlags: [
      "Sudden onset (Stroke concern)",
      "Associated with weakness",
      "Difficulty swallowing"
    ]
  },
  {
    id: "facial_twitching",
    label: "Facial Twitching / Spasms",
    dimensions: {
      location: ["eyelid", "corner of mouth", "cheek"],
      frequency: ["intermittent", "constant"]
    },
    redFlags: [
      "Complete eyelid closure",
      "Spasms spreading to neck",
      "Associated with weakness"
    ]
  },
  {
    id: "neck_pain_stiffness",
    label: "Neck Pain / Stiffness",
    dimensions: {
      onset: ["sudden", "after injury", "gradual"],
      limitations: ["difficulty touching chin to chest", "pain on turning head"],
      radiation: ["to shoulders", "down arms", "to back of head"]
    },
    redFlags: [
      "Fever and severe headache",
      "Inability to flex neck",
      "Weakness in hands/arms",
      "Pain following significant trauma"
    ]
  },
  {
    id: "neck_swelling_masses",
    label: "Neck Swelling / Masses",
    dimensions: {
      location: ["front of neck", "sides of neck", "under jaw"],
      character: ["hard/fixed", "soft/rubbery", "tender", "painless"],
      mobility: ["moves with swallowing", "fixed to tissue"]
    },
    redFlags: [
      "Rapidly growing lump",
      "Hard, painless, fixed node",
      "Lump above collarbone (Supraclavicular)",
      "Persistent hoarseness"
    ]
  },
  {
    id: "lymph_node_enlargement",
    label: "Lymph Node Enlargement (Neck)",
    dimensions: {
      duration: ["recent", "persisting > 3 weeks"],
      associated: ["sore throat", "fever", "weight loss", "night sweats"]
    },
    redFlags: [
      "Fixed, matted nodes",
      "Size > 2cm",
      "Systemic 'B symptoms' (fever/weight loss/sweats)"
    ]
  },
  {
    id: "limited_neck_movement",
    label: "Limited Neck Movement",
    dimensions: {
      direction: ["rotation (turning)", "flexion (down)", "extension (up)"],
      reason: ["pain", "mechanical blockage", "muscle spasm"]
    },
    redFlags: [
      "Meningismus (stiff neck with fever/light sensitivity)",
      "Pain referred to arm/hand"
    ]
  },
  {
    id: "thyroid_enlargement",
    label: "Thyroid Enlargement (Goiter symptoms)",
    dimensions: {
      sensation: ["pressure in neck", "tightness when wearing collars"],
      associated: ["difficulty swallowing", "voice changes", "feelings of heat/cold"]
    },
    redFlags: [
      "Difficulty breathing",
      "Rapid growth of neck mass",
      "Voice hoarseness"
    ]
  },
  {
    id: "throat_tightness",
    label: "Throat Tightness (Neck-related)",
    dimensions: {
      character: ["globus sensation (lump)", "constriction", "choking feeling"],
      triggers: ["stress", "after meals", "constant"]
    },
    redFlags: [
      "True difficulty swallowing",
      "Painful swallowing",
      "Weight loss"
    ]
  }
];

export const EAR_MODELS: SymptomModel[] = [
  {
    id: "ear_hearing_loss",
    label: "Hearing Loss",
    dimensions: {
      onset: ["sudden (ENT emergency)", "gradual", "fluctuating"],
      location: ["one ear (unilateral)", "both ears (bilateral)"],
      character: ["muffled sounds", "difficulty understanding speech", "total loss"],
      progression: ["improving", "stable", "worsening"]
    },
    redFlags: [
      "Sudden unilateral hearing loss (ENT emergency)",
      "Hearing loss after head trauma",
      "Progressive loss in only one ear",
      "Associated neurological symptoms"
    ]
  },
  {
    id: "ear_tinnitus",
    label: "Tinnitus (Ringing/Noise in ears)",
    dimensions: {
      type: ["ringing", "buzzing/hissing", "pulsatile (matches heartbeat)", "roaring"],
      location: ["one ear", "both ears", "inside head"],
      frequency: ["constant", "intermittent", "only in quiet"]
    },
    redFlags: [
      "Pulsatile tinnitus (vascular cause suspicion)",
      "Unilateral tinnitus (one side only)",
      "Associated with sudden hearing loss or vertigo"
    ]
  },
  {
    id: "ear_fullness_pressure",
    label: "Ear Fullness / Pressure",
    dimensions: {
      sensation: ["clogged feeling", "pressure sensation", "muffled"],
      triggers: ["after swimming", "during/after a cold", "altitude changes"],
      relief: ["improves with yawning/popping", "constant"]
    },
    redFlags: [
      "Persistent pressure in one ear only",
      "Associated with vertigo",
      "Rapid onset with hearing loss"
    ]
  },
  {
    id: "ear_pain_otalgia",
    label: "Ear Pain (Otalgia)",
    dimensions: {
      location: ["deep inside", "outer ear canal", "behind the ear"],
      character: ["sharp/stabbing", "dull/aching", "throbbing"],
      triggers: ["chewing", "pulling on earflap", "spontaneous"]
    },
    redFlags: [
      "Fever and swelling behind the ear (Mastoiditis)",
      "Severe pain unresponsive to medication",
      "Pain in adult with no ear finding (referred pain screening)"
    ]
  },
  {
    id: "ear_discharge_otorrhea",
    label: "Ear Discharge (Otorrhea)",
    dimensions: {
      character: ["clear/watery", "pus-like (yellow/green)", "bloody", "foul-smelling"],
      duration: ["acute", "chronic (recurrent)"]
    },
    redFlags: [
      "Bloody or clear discharge after head trauma",
      "Fever + discharge (acute infection complication)",
      "Painless chronic foul discharge"
    ]
  },
  {
    id: "ear_itching_irritation",
    label: "Ear Itching / Irritation",
    dimensions: {
      severity: ["mild bothersome", "intense itching"],
      associated: ["dry skin/flaking", "pain when touched", "swelling"]
    },
    redFlags: [
      "Spreading redness to the face",
      "Complete closure of the ear canal from swelling"
    ]
  },
  {
    id: "ear_foreign_body_sensation",
    label: "Foreign Body Sensation",
    dimensions: {
      onset: ["sudden (know something's in there)", "vague sensation"],
      associated: ["hearing loss", "pain", "movement/buzzing (insect)"]
    },
    redFlags: [
      "Bleeding from the ear",
      "Severe pain or sudden deafness"
    ]
  },
  {
    id: "ear_vertigo_vestibular",
    label: "Vertigo / Balance (Ear-related)",
    dimensions: {
      type: ["spinning (vertigo)", "unsteadiness", "gait instability", "motion intolerance"],
      triggers: ["head movement", "standing up", "spontaneous"],
      associated: ["nausea/vomiting", "fullness", "hearing change"]
    },
    redFlags: [
      "Vertigo with double vision or slurred speech (Stroke alert)",
      "Inability to walk or stand",
      "Sudden hearing loss with vertigo"
    ],
    requiredExams: [
      "Dix-Hallpike maneuver",
      "HINTS exam for acute vestibular syndrome",
      "Assess for nystagmus"
    ]
  },
  {
    id: "ear_infection_recurrent",
    label: "Recurrent Ear Infections",
    dimensions: {
      frequency: ["multiple times per year", "constant drainage"],
      associated: ["childhood history", "fever", "hearing decline"]
    },
    redFlags: [
      "Fever and chills with ear pain",
      "Swelling or redness behind the ear",
      "Developmental/speech delay in children"
    ]
  },
  {
    id: "ear_post_uri",
    label: "Post-Cold/URI Ear Symptoms",
    dimensions: {
      timing: ["started during cold", "started after cold mostly resolved"],
      sensation: ["fluid sloshing", "muffled", "popping/clicking"]
    },
    redFlags: [
      "Severe pain returning after getting better",
      "High fever"
    ]
  },
  {
    id: "ear_hearing_fluctuation",
    label: "Hearing Fluctuation",
    dimensions: { timing: ["sudden drops", "random variability"], associated: ["vertigo", "tinnitus", "ear fullness (Ménière's concern)"] }
  },
  {
    id: "ear_noise_sensitivity",
    label: "Noise Sensitivity (Hyperacusis)",
    dimensions: { severity: ["mildly annoying", "painful"], associated: ["tinnitus", "headache"] }
  }
];

export const EYE_MODELS: SymptomModel[] = [
  {
    id: "eye_vision_blurred",
    label: "Blurred Vision",
    dimensions: {
      onset: ["sudden", "gradual"],
      location: ["one eye", "both eyes"],
      character: ["all the time", "comes and goes", "difficulty focusing"]
    },
    redFlags: [
      "Sudden vision loss (retinal/vascular emergency)",
      "Severe eye pain",
      "Associated with headache and nausea"
    ]
  },
  {
    id: "eye_vision_loss_sudden",
    label: "Sudden Vision Loss",
    dimensions: {
      onset: ["instantaneous", "over minutes", "over hours"],
      location: ["one eye", "both eyes", "part of visual field"],
      character: ["complete darkness", "graying out", "blurring"]
    },
    redFlags: [
      "Requires immediate emergency evaluation",
      "Associated with eye pain",
      "Associated with neurological symptoms (weakness/speech)"
    ]
  },
  {
    id: "eye_vision_loss_gradual",
    label: "Gradual Vision Loss",
    dimensions: {
      progression: ["over weeks", "over months", "over years"],
      character: ["central blurring", "peripheral loss (tunnel vision)", "night vision problems"]
    },
    redFlags: [
      "Progressive worsening that doesn't stabilize",
      "Pain associated with movement"
    ]
  },
  {
    id: "eye_diplopia",
    label: "Double Vision (Diplopia)",
    dimensions: {
      type: ["horizontal", "vertical", "diagonal"],
      condition: ["goes away if one eye covered", "persists with one eye covered"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Sudden onset double vision",
      "Associated with neurological symptoms (brainstem pathology)",
      "New pupil size difference"
    ]
  },
  {
    id: "eye_pain_ocular",
    label: "Eye Pain (Ocular Pain)",
    dimensions: {
      location: ["on the surface", "deep inside", "behind the eye"],
      character: ["burning", "stabbing/sharp", "aching", "pressure"],
      triggers: ["eye movement", "light", "touch"]
    },
    redFlags: [
      "Eye pain + red eye + vision loss (acute glaucoma / uveitis)",
      "Pain after chemical exposure",
      "Deep, boring pain preventing sleep"
    ]
  },
  {
    id: "eye_foreign_body",
    label: "Foreign Body Sensation",
    dimensions: {
      character: ["gritty/sandy", "something stuck"],
      associated: ["tearing", "redness", "pain with blinking"]
    },
    redFlags: [
      "Known trauma with metal/glass",
      "Reduced vision",
      "Pupil looking irregular"
    ]
  },
  {
    id: "eye_photophobia",
    label: "Light Sensitivity (Photophobia)",
    dimensions: {
      severity: ["mild discomfort", "need sunglasses indoors", "painful"],
      onset: ["sudden", "chronic"]
    },
    redFlags: [
      "Associated with stiff neck and fever",
      "Severe pain when light hits eye"
    ]
  },
  {
    id: "eye_redness_inflammation",
    label: "Red Eye / Inflammation",
    dimensions: {
      location: ["across the white part", "localized spot", "eyelids"],
      sensation: ["itching", "irritation", "burning"],
      associated: ["discharge", "swelling"]
    },
    redFlags: [
      "Vision changes with redness",
      "Pain with redness",
      "Cloudy cornea"
    ]
  },
  {
    id: "eye_swelling",
    label: "Eye / Eyelid Swelling",
    dimensions: {
      location: ["eyelid only (Ptosis)", "entire eye area", "protruding eye (Proptosis)"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Proptosis (bulging eye) + pain (orbital infection / tumor concern)",
      "Inability to move the eye",
      "Vision loss"
    ]
  },
  {
    id: "eye_discharge_tearing",
    label: "Eye Discharge / Tear Changes",
    dimensions: {
      character: ["excessive tearing (epiphora)", "purulent (pus-like)", "clear/watery", "sticky/crusty"],
      timing: ["worse in morning", "constant"]
    },
    redFlags: [
      "Rapidly increasing swelling and pain",
      "Reduced vision"
    ]
  },
  {
    id: "eye_dryness",
    label: "Dry Eyes",
    dimensions: {
      character: ["stinging", "sandy feeling", "fatigued"],
      associated: ["dry mouth/joint pain (Sjögren's screening)", "worse with screen use"]
    },
    redFlags: [
      "Inability to produce any tears",
      "Corneal cloudiness"
    ]
  },
  {
    id: "eye_movement_issues",
    label: "Eye Movement / Functional Issues",
    dimensions: {
      type: ["pain with movement", "restricted movement", "misalignment (strabismus)", "uncontrolled jiggling (nystagmus)"],
      location: ["one eye", "both eyes"]
    },
    redFlags: [
      "Sudden onset misalignment",
      "Associated with neurological deficits",
      "Pain with movement + vision loss"
    ]
  },
  {
    id: "eye_neuro_ophthalmic",
    label: "Neuro-ophthalmic Symptoms",
    dimensions: {
      type: ["visual field loss", "tunnel vision", "blind spots (scotomas)", "transient obscurations"],
      character: ["sudden", "flickering", "blackout"]
    },
    redFlags: [
      "Sudden onset visual field loss",
      "Associated with slurred speech or weakness"
    ]
  },
  {
    id: "eye_flashes_floaters",
    label: "Flashes & Floaters",
    dimensions: {
      type: ["flashes of light (photopsia)", "floaters (spots/webs)", "shadows"],
      frequency: ["shower of many new ones", "stable occasional spots"]
    },
    redFlags: [
      "Flashes + floaters (retinal detachment risk)",
      "Sudden 'curtain' or veil over vision",
      "Recent eye trauma"
    ]
  },
  {
    id: "eye_strain",
    label: "Eye Strain / Fatigue",
    dimensions: { triggers: ["screen use", "reading", "night driving"], relief: ["resting eyes"] }
  }
];

export const THROAT_MODELS: SymptomModel[] = [
  // NASAL SYMPTOMS
  {
    id: "nasal_congestion",
    label: "Nasal Congestion (Stuffy Nose)",
    dimensions: {
      location: ["one side", "both sides", "alternating"],
      timing: ["morning", "night", "worse when lying down", "seasonal"],
      duration: ["acute (new)", "chronic (long-term)"]
    },
    redFlags: [
      "Facial pain or pressure",
      "Persistent blockage in one side only",
      "Associated with high fever"
    ]
  },
  {
    id: "rhinorrhea",
    label: "Runny Nose (Rhinorrhea)",
    dimensions: {
      character: ["clear/watery", "thick/discolored (yellow/green)", "bloody", "pus-like"],
      trigger: ["cold air", "eating", "allergens", "irritants"],
      associated: ["sneezing", "nasal itching", "postnasal drip"]
    },
    redFlags: [
      "Clear fluid after head trauma (CSF fluid risk)",
      "Foul-smelling discharge from one side only"
    ]
  },
  {
    id: "postnasal_drip",
    label: "Postnasal Drip",
    dimensions: {
      sensation: ["mucus in back of throat", "frequent clearing", "tickle"],
      associated: ["cough", "sore throat", "hoarseness"]
    }
  },
  {
    id: "smell_disturbance",
    label: "Loss or Reduced Smell (Anosmia/Hyposmia)",
    dimensions: {
      onset: ["sudden", "gradual"],
      character: ["total loss (anosmia)", "reduced sensation (hyposmia)"],
      associated: ["taste disturbance"]
    },
    redFlags: [
      "Sudden onset without nasal symptoms",
      "Associated with neurological changes"
    ]
  },
  {
    id: "epistaxis",
    label: "Nosebleed (Epistaxis)",
    dimensions: {
      frequency: ["first time", "recurrent"],
      severity: ["minor spotting", "heavy flow", "uncontrollable"],
      trigger: ["spontaneous", "picking/trauma", "dry air"]
    },
    redFlags: [
      "Uncontrollable bleeding",
      "Recurrent or very heavy bleeding (coagulopathy / tumor suspicion)",
      "Bleeding from both nostrils or posterior throat"
    ]
  },

  // MOUTH SYMPTOMS
  {
    id: "mouth_ulcers",
    label: "Mouth Ulcers / Sores",
    dimensions: {
      location: ["tongue", "inner cheek", "gums", "lips"],
      character: ["single ulcer", "multiple/clusters", "painful", "painless"],
      duration: ["heals within 2 weeks", "persists > 3 weeks"]
    },
    redFlags: [
      "Ulcers persisting > 3 weeks (malignancy screening)",
      "Associated with systemic symptoms (fever/rash/weight loss)",
      "Recurrent aggressive ulcers (autoimmune / HIV suspicion)"
    ]
  },
  {
    id: "oral_pain_burning",
    label: "Oral Pain / Burning Sensation",
    dimensions: {
      location: ["tongue", "roof of mouth", "generalized"],
      character: ["burning sensation", "sharp pain", "soreness"],
      associated: ["dry mouth", "taste changes"]
    }
  },
  {
    id: "gum_bleeding_swelling",
    label: "Gum Issues (Bleeding/Swelling)",
    dimensions: {
      type: ["bleeding when brushing", "painful/swollen gums", "receding gums"],
      associated: ["tooth pain", "bad breath"]
    },
    redFlags: [
      "Severe spontaneous bleeding",
      "Loose teeth without trauma"
    ]
  },
  {
    id: "xerostomia_dry_mouth",
    label: "Dry Mouth (Xerostomia)",
    dimensions: {
      timing: ["morning/waking", "constant", "only when talking"],
      associated: ["frequent thirst", "difficulty speaking", "burning tongue"]
    },
    redFlags: [
      "Associated with dry eyes and joint pain (Sjögren's risk)",
      "Significant difficulty swallowing due to dryness"
    ]
  },
  {
    id: "halitosis",
    label: "Bad Breath (Halitosis)",
    dimensions: {
      character: ["chronic", "recent change"],
      associated: ["bad taste (dysgeusia)", "tonsil stones", "postnasal drip"]
    },
    redFlags: [
      "Fecal or fruity odor (Systemic issues alert)"
    ]
  },
  {
    id: "taste_disturbance",
    label: "Taste Disturbance (Dysgeusia)",
    dimensions: {
      character: ["metallic taste", "bitter", "loss of taste", "reduced taste"],
      onset: ["sudden", "gradual"]
    }
  },

  // THROAT SYMPTOMS
  {
    id: "sore_throat",
    label: "Sore Throat",
    dimensions: {
      severity: ["mild irritation/scratchy", "moderate", "severe pain"],
      associated: ["fever", "cough", "white patches/exudates", "swollen tonsils", "tender neck nodes"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Drooling or inability to swallow saliva (Epiglottitis alert)",
      "Muffled 'hot potato' voice",
      "Difficulty breathing or stridor",
      "Severe neck swelling"
    ]
  },
  {
    id: "throat_dysphagia",
    label: "Difficulty Swallowing (Dysphagia)",
    dimensions: {
      type: ["difficulty with solids", "difficulty with liquids", "choking/coughing when swallowing"],
      location: ["high in throat", "behind breastbone"],
      onset: ["sudden/acute", "gradual and progressive"]
    },
    redFlags: [
      "Progressive dysphagia + weight loss (malignancy suspicion)",
      "Sudden inability to swallow anything",
      "Frequent aspiration (food/liquid going into lungs)"
    ]
  },
  {
    id: "odynophagia",
    label: "Painful Swallowing (Odynophagia)",
    dimensions: {
      severity: ["sharp pain", "intense burning"],
      location: ["central", "one-sided"]
    },
    redFlags: [
      "Severe pain preventing oral intake",
      "Pain localized to one side of the throat"
    ]
  },
  {
    id: "throat_hoarseness",
    label: "Hoarseness or Voice Change",
    dimensions: {
      duration: ["under 1 week", "1-3 weeks", "over 3 weeks"],
      quality: ["raspy", "breathy/weak", "strained", "muffled"]
    },
    redFlags: [
      "Hoarseness persisting > 3 weeks (laryngeal cancer rule-out)",
      "Difficulty breathing",
      "Neck mass associated with voice change"
    ]
  },
  {
    id: "throat_tightness_globus",
    label: "Throat Tightness / foreign body sensation",
    dimensions: {
      character: ["lump in throat (globus)", "constriction", "something stuck"],
      relation_to_food: ["better while eating", "worse after eating", "constant"]
    },
    redFlags: [
      "Actual difficulty swallowing food",
      "Pain associated with the sensation",
      "Weight loss"
    ]
  },
  {
    id: "nasal_sneezing",
    label: "Sneezing",
    dimensions: { frequency: ["occasional", "frequent bursts"], triggers: ["dust", "pollen", "bright light", "spontaneous"] }
  },
  {
    id: "nasal_dryness",
    label: "Nasal Dryness",
    dimensions: { severity: ["mild", "severe with crusting"], associated: ["nosebleeds"] }
  },
  {
    id: "oral_tooth_pain",
    label: "Tooth Pain",
    dimensions: { location: ["upper jaw", "lower jaw", "specific tooth"], character: ["sharp", "throbbing", "sensitivity to cold/heat"] }
  },
  {
    id: "oral_tongue_swelling",
    label: "Tongue Swelling / Pain",
    dimensions: { onset: ["sudden (hours)", "gradual"], associated: ["difficulty speaking", "difficulty swallowing"] },
    redFlags: ["Rapid swelling with difficulty breathing (Anaphylaxis risk)"]
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
    ],
    requiredExams: [
      "Perform straight leg raise test",
      "Assess for saddle anesthesia",
      "Check lower extremity strength and reflexes",
      "Perform palpation for spinal tenderness"
    ]
  }
];

export const LUNGS_MODELS: SymptomModel[] = [
  // BREATHING SYMPTOMS
  {
    id: "lungs_dyspnea",
    label: "Shortness of Breath (Dyspnea)",
    dimensions: {
      onset: ["sudden (Emergency)", "gradual over days", "chronic"],
      triggers: ["at rest", "light activity", "heavy exertion (DOE)", "no clear trigger"],
      severity: ["cannot speak in full sentences", "affects normal conversation", "only with exercise"]
    },
    redFlags: [
      "Sudden severe dyspnea (PE / Asthma attack / Pneumothorax alert)",
      "Inability to speak sentences",
      "Bluish tint to lips/fingernails (Cyanosis)",
      "Silent chest (no air movement heard)"
    ],
    requiredExams: [
      "Auscultation for wheezing, crackles, or absent breath sounds",
      "Check oxygen saturation",
      "Assess for use of accessory muscles"
    ]
  },
  {
    id: "lungs_noisy_breathing",
    label: "Noisy Breathing / Stridor",
    dimensions: { character: ["whistling (Stridor)", "snoring (Stertor)", "rattling"], associated: ["difficulty swallowing", "hoarseness"] },
    redFlags: ["Sudden stridor (Airway emergency)"]
  },
  {
    id: "lungs_rapid_breathing",
    label: "Rapid Breathing / Air Hunger",
    dimensions: { character: ["gasping", "shallow but fast", "feeling of not enough air"], associated: ["anxiety", "chest pain"] }
  },
  {
    id: "lungs_positional_breathing",
    label: "Positional Breathing Issues (Orthopnea/PND)",
    dimensions: {
      type: ["difficulty breathing when flat (Orthopnea)", "waking up gasping at night (PND)"],
      severity: ["needs 1 pillow", "needs 2+ pillows", "must sleep in chair"]
    },
    redFlags: [
      "Orthopnea + leg/ankle edema (Heart failure suspicion)",
      "Sudden waking with extreme air hunger and frothy sputum",
      "Worsening weight gain with these symptoms"
    ]
  },
  {
    id: "lungs_tachypnea_air_hunger",
    label: "Rapid Breathing / Air Hunger",
    dimensions: {
      character: ["feeling 'air hunger'", "rapid/shallow breathing (Tachypnea)", "gasping"],
      associated: ["anxiety/panic", "chest tightness"]
    },
    redFlags: [
      "Breathing rate > 30 bpm",
      "Confusion or altered mental state",
      "Central cyanosis"
    ]
  },
  {
    id: "lungs_noisy_breathing_variant",
    label: "Noisy Breathing (Stridor/Wheezing)",
    dimensions: {
      type: ["high-pitched on inspiration (Stridor)", "whistling on expiration (Wheezing)", "snoring/gurgling"],
      associated: ["cough", "throat tightness"]
    },
    redFlags: [
      "Stridor (severe upper airway obstruction alert)",
      "Drooling or inability to swallow with noisy breathing",
      "Rapidly worsening obstruction"
    ]
  },

  // COUGH SYMPTOMS
  {
    id: "lungs_cough",
    label: "Cough",
    dimensions: {
      character: ["dry/hacking", "productive (wet/phlegm)", "whooping/paroxysmal", "barking"],
      duration: ["acute (< 3 weeks)", "subacute (3-8 weeks)", "chronic (> 8 weeks)"],
      timing: ["nocturnal (at night)", "morning only", "post-viral sequence", "constant"]
    },
    redFlags: [
      "Coughing up significant blood (Hemoptysis)",
      "High fever and chills",
      "Significant unexplained weight loss",
      "New cough in long-term smoker"
    ]
  },

  // SPUTUM / SECRETIONS
  {
    id: "lungs_sputum",
    label: "Sputum / Phlegm Production",
    dimensions: {
      character: ["clear/white", "yellow/green (purulent)", "thick/tenacious", "foul-smelling", "pink/frothy"],
      amount: ["small/streaks", "significant teaspoons", "cups per day"]
    },
    redFlags: [
      "Blood-streaked or frank blood (TB / Cancer / PE alert)",
      "Pink, frothy sputum (Pulmonary edema alert)",
      "Foul-smelling 'anchovy paste' or similar unique odors"
    ]
  },

  // CHEST SOUNDS & SENSATION
  {
    id: "lungs_chest_tightness_congestion",
    label: "Chest Tightness / Congestion",
    dimensions: {
      character: ["squeezing sensation", "heavy weight", "congestion/rattle", "internal crackling"],
      triggers: ["cold air", "exercise", "allergens"]
    },
    redFlags: [
      "Radiating to neck/arm/jaw",
      "Associated with profuse sweating (Diaphoresis)",
      "Not relieved by rest"
    ]
  },

  // CHEST DISCOMFORT
  {
    id: "lungs_pleuritic_pain",
    label: "Pain with Breathing (Pleuritic)",
    dimensions: {
      character: ["sharp/stabbing", "catches when breathing in", "localized"],
      triggers: ["deep breath", "coughing", "sneezing", "movement"]
    },
    redFlags: [
      "Pleuritic chest pain + sudden dyspnea (Pulmonary Embolism alert)",
      "Pleuritic pain + fever + productive cough (Pneumonia alert)",
      "Trauma to chest preceding pain"
    ]
  },
  {
    id: "lungs_chest_burning_pressure",
    label: "Chest Burning / Pressure",
    dimensions: {
      character: ["burning sensation", "pressure/fullness", "generalized ache"],
      relation_to_meals: ["worse after eating", "unrelated to food"],
      relation_to_exertion: ["comes on with walking", "stable at rest"]
    }
  },

  // INFECTIOUS / INFLAMMATORY
  {
    id: "lungs_infections_recurrent",
    label: "Recurrent Chest Infections",
    dimensions: {
      frequency: ["multiple times per year", "lingering 'colds' that go to chest"],
      associated: ["smoker history", "chronic fatigue", "fever"]
    },
    redFlags: [
      "Recurrent pneumonia in the same lung area",
      "Night sweats and weight loss"
    ]
  }
];

export const HEART_MODELS: SymptomModel[] = [
  // CHEST SYMPTOMS
  {
    id: "heart_chest_pain_pressure",
    label: "Chest Pain or Pressure",
    dimensions: {
      location: ["central (retrosternal)", "left-sided", "radiating to left arm", "radiating to jaw/neck", "radiating to back"],
      character: ["crushing/heavy pressure", "tightness/squeezing", "sharp/stabbing", "burning sensation"],
      onset: ["sudden", "gradual", "with exertion", "at rest"],
      duration: ["seconds", "minutes (persistent)", "hours"]
    },
    redFlags: [
      "Acute crushing chest pain (MI suspicion)",
      "Chest pain + radiation + profuse sweating (Diaphoresis)",
      "Pain not relieved by rest or nitroglycerin (if prescribed)",
      "Pain associated with severe nausea/vomiting"
    ],
    requiredExams: [
      "Check blood pressure and heart rate",
      "Auscultate for murmurs or rubs",
      "Assess for JVD",
      "Check peripheral pulses"
    ]
  },
  {
    id: "heart_pleuritic_pain",
    label: "Pleuritic Chest Pain (Cardiac-related)",
    dimensions: {
      character: ["sharp/stabbing", "worse with deep breath", "worse when lying flat"],
      relief: ["improves when leaning forward (Pericarditis screening)"]
    },
    redFlags: [
      "Sudden onset + dyspnea (Pulmonary Embolism suspicion)",
      "Associated fever and friction rub"
    ]
  },

  // CARDIAC SYMPTOMS
  {
    id: "heart_palpitations",
    label: "Palpitations / Rhythm Changes",
    dimensions: {
      character: ["racing heart (tachycardia)", "irregular/skipped beats (ectopy)", "fluttering", "pounding in chest"],
      onset: ["sudden start/stop", "gradual"],
      triggers: ["exertion", "stress", "caffeine", "at rest"]
    },
    redFlags: [
      "Palpitations + fainting (Syncope)",
      "Palpitations + severe chest pain",
      "Heart rate > 150 bpm at rest"
    ]
  },
  {
    id: "heart_syncope_fainting",
    label: "Fainting or Near-Fainting (Syncope)",
    dimensions: {
      type: ["complete loss of consciousness (Syncope)", "near-fainting/blacking out (Presyncope)", "lightheadedness on standing"],
      triggers: ["during exertion", "standing up", "emotional stress", "no warning"]
    },
    redFlags: [
      "Syncope during physical exertion (Arrhythmia/Structural heart disease alert)",
      "Sudden syncope without prodrome",
      "Associated chest pain or palpitations",
      "Fainting with known heart condition"
    ]
  },

  // CIRCULATORY / PERFUSION SYMPTOMS
  {
    id: "heart_dyspnea_perfusion",
    label: "Circulatory Shortness of Breath",
    dimensions: {
      type: ["Shortness of breath on exertion (DOE)", "Difficulty breathing when flat (Orthopnea)", "Waking gasping at night (PND)"],
      severity: ["worsening exercise intolerance", "needs multiple pillows to sleep"]
    },
    redFlags: [
      "Orthopnea + leg/ankle swelling (Heart failure alert)",
      "Sudden waking with extreme air hunger"
    ]
  },
  {
    id: "heart_limb_swelling_edema",
    label: "Leg or Arm Swelling (Edema)",
    dimensions: {
      location: ["both legs (bilateral)", "one leg only (unilateral)", "hands/arms"],
      severity: ["pitting (leaves indentation)", "non-pitting"]
    },
    redFlags: [
      "Sudden unilateral leg swelling + pain (DVT alert)",
      "Swelling associated with shortness of breath",
      "Rapid weight gain (fluid retention)"
    ]
  },
  {
    id: "heart_peripheral_perfusion",
    label: "Peripheral Circulation Issues",
    dimensions: {
      character: ["cold extremities", "skin color changes (cyanosis/blue)", "paleness (pallor)"],
      location: ["fingertips", "toes", "generalized"]
    },
    redFlags: [
      "Sudden cold, painful, pale limb (Acute limb ischemia alert)",
      "Central cyanosis (blue lips/tongue)"
    ]
  },

  // VASCULAR SYMPTOMS
  {
    id: "heart_claudication",
    label: "Leg Pain on Walking (Claudication)",
    dimensions: {
      character: ["cramping in calves/thighs", "aching", "heaviness"],
      triggers: ["starts with walking same distance", "relieved by rest"]
    },
    redFlags: [
      "Pain at rest",
      "Non-healing ulcers on feet/toes"
    ]
  },
  {
    id: "heart_venous_varicose",
    label: "Venous Symptoms (Varicose/Stasis)",
    dimensions: {
      character: ["aching/heaviness in legs", "visible bulging veins", "leg fatigue at end of day"],
      associated: ["skin discoloration near ankles", "itching"]
    }
  },

  // ASSOCIATED SYSTEMIC CLUES
  {
    id: "heart_exercise_intolerance",
    label: "Exercise Intolerance / Fatigue",
    dimensions: {
      character: ["reduced capacity for usual activity", "extreme fatigue after light exertion"],
      onset: ["recent change", "chronic"]
    },
    redFlags: [
      "Rapidly declining stamina",
      "Associated with chest pressure or dyspnea"
    ]
  }
];

export const DIGESTIVE_MODELS: SymptomModel[] = [
  // UPPER GI SLOTS
  {
    id: "gi_abdominal_pain_epigastric",
    label: "Epigastric Pain (Upper Center)",
    dimensions: {
      character: ["gnawing/hunger-like", "sharp", "burning", "dull ache"],
      relation_to_food: ["worse after eating", "better after eating", "worse when hungry"],
      associated: ["bloating", "nausea"]
    },
    redFlags: ["Radiates to back", "Associated with black tarry stools"]
  },
  {
    id: "gi_abdominal_pain_ruq",
    label: "Right Upper Quadrant (RUQ) Pain",
    dimensions: {
      character: ["crampy (Colicky)", "steady/severe", "aching"],
      associated: ["nausea/vomiting", "jaundice", "fever", "pain in right shoulder"]
    },
    redFlags: ["Murphy's sign positive", "Associated jaundice and fever"]
  },
  {
    id: "gi_reflux_heartburn",
    label: "Heartburn / Acid Reflux (GERD)",
    dimensions: {
      location: ["behind breastbone", "reaching throat"],
      triggers: ["lying down", "spicy foods", "large meals"],
      associated: ["bitter taste", "regurgitation", "chronic cough"]
    }
  },
  {
    id: "gi_nausea_vomiting",
    label: "Nausea & Vomiting",
    dimensions: {
      content: ["food", "bile (yellow/green)", "blood (Hematemesis)", "coffee grounds"],
      frequency: ["intermittent", "constant", "projectile"],
      associated: ["abdominal pain", "dizziness"]
    },
    redFlags: ["Vomiting blood", "Signs of dehydration", "Inability to keep fluids down"]
  },
  {
    id: "gi_dysphagia_difficulty_swallowing",
    label: "Difficulty Swallowing (Dysphagia)",
    dimensions: {
      type: ["solids", "liquids", "both"],
      location: ["high (throat)", "low (chest)"],
      associated: ["pain when swallowing (Odynophagia)", "weight loss"]
    },
    redFlags: ["Progressive dysphagia", "Associated weight loss"]
  },

  // LOWER GI SLOTS
  {
    id: "gi_abdominal_pain_llq",
    label: "Lower Left Quadrant (LLQ) Pain",
    dimensions: {
      character: ["crampy", "persistent ache"],
      associated: ["fever", "constipation", "diarrhea", "bloating"]
    },
    redFlags: ["Severe pain + fever (Diverticulitis suspicion)"]
  },
  {
    id: "gi_abdominal_pain_rlq",
    label: "Lower Right Quadrant (RLQ) Pain",
    dimensions: {
      character: ["sharp", "shifting from umbilicus", "steady"],
      associated: ["fever", "nausea", "loss of appetite"]
    },
    redFlags: ["McBurney point tenderness", "Rebound tenderness"]
  },
  {
    id: "gi_diarrhea",
    label: "Diarrhea",
    dimensions: {
      type: ["watery", "bloody/mucus", "oily (Steatorrhea)", "mushy"],
      frequency: ["3-5 times/day", ">5 times/day"],
      duration: ["acute (<2 weeks)", "chronic (>4 weeks)"]
    },
    redFlags: ["Bloody stools", "Nocturnal diarrhea (wakes from sleep)", "Dehydration"]
  },
  {
    id: "gi_constipation",
    label: "Constipation",
    dimensions: {
      character: ["hard/lumpy stools", "straining", "incomplete evacuation"],
      frequency: ["<3 times per week", "recent change"]
    },
    redFlags: ["Sudden change in elderly", "Thin/pencil stools", "Weight loss"]
  },
  {
    id: "gi_bloating_distension",
    label: "Abdominal Bloating & Gas",
    dimensions: { sensation: ["fullness", "pressure", "visible distension"], associated: ["excessive flatulence", "burping"] }
  },
  {
    id: "gi_bleeding_rectal",
    label: "Rectal Bleeding / Stool Blood",
    dimensions: {
      character: ["bright red (Hematochezia)", "maroon", "black tarry (Melena)", "only on paper"],
      associated: ["pain with BM", "dizziness"]
    },
    redFlags: ["Melena (Upper GI bleed)", "Significant volume", "Postmenopausal bleeding (anal/rectal)"]
  },

  // SYSTEMIC GI
  {
    id: "gi_jaundice",
    label: "Jaundice (Yellow eyes/skin)",
    dimensions: { associated: ["dark urine", "pale stools", "itching", "abdominal pain"] },
    redFlags: ["Painless jaundice", "Fever + RUQ pain + Jaundice"]
  },
  {
    id: "gi_early_satiety",
    label: "Early Satiety (Fullness quickly)",
    dimensions: { severity: ["after a few bites", "moderate"], associated: ["nausea", "weight loss"] }
  },
  {
    id: "gi_tenesmus",
    label: "Tenesmus (Constant urge)",
    dimensions: { character: ["painful straining", "feeling of incomplete evacuation"] }
  },
  {
    id: "gi_distension",
    label: "Abdominal Distension",
    dimensions: { character: ["visible swelling", "tightness"] }
  },
  {
    id: "gi_food_intolerance",
    label: "Food Intolerance",
    dimensions: { triggers: ["dairy", "gluten", "fatty foods", "spicy foods"] }
  }
];

export const KIDNEY_MODELS: SymptomModel[] = [
  // URINARY SYMPTOMS
  {
    id: "renal_dysuria",
    label: "Painful Urination (Dysuria)",
    dimensions: {
      character: ["burning sensation", "sharp pain", "stinging"],
      timing: ["during urination", "after urination"],
      associated: ["urgency", "frequency", "foul smell"]
    },
    redFlags: [
      "Fever and chills (Pyelonephritis alert)",
      "Severe back/flank pain",
      "Visible blood in urine"
    ]
  },
  {
    id: "renal_frequency_urgency",
    label: "Frequency & Urgency",
    dimensions: {
      type: ["increased frequency (more often)", "urgency (sudden strong need)", "both"],
      nocturia: ["waking at night to urinate (Nocturia)"],
      frequency_count: ["every hour", "every 2 hours", "more than 8 times/day"]
    },
    redFlags: [
      "Sudden changes with excessive thirst (Diabetes screening)",
      "Associated with fever"
    ]
  },
  {
    id: "renal_obstructive_voiding",
    label: "Voiding Issues (Hesitancy/Weak Stream)",
    dimensions: {
      character: ["difficulty starting (Hesitancy)", "weak stream", "intermittent/stop-start", "straining to finish"],
      sensation: ["feeling of incomplete emptying"]
    },
    redFlags: [
      "Complete inability to urinate (Acute retention ER alert)",
      "Lower back pain and leg weakness (Cauda equina alert)"
    ]
  },
  {
    id: "renal_incontinence",
    label: "Urinary Incontinence",
    dimensions: {
      type: ["leakage with cough/sneeze (Stress)", "sudden urge followed by leak (Urge)", "constant dribbling (Overflow)"],
      frequency: ["occasional", "daily", "requires pads"]
    }
  },

  // URINE APPEARANCE
  {
    id: "renal_hematuria",
    label: "Blood in Urine (Hematuria)",
    dimensions: {
      color: ["bright red", "pink", "dark/cola-colored (old blood)", "clots visible"],
      associated: ["pain during urination", "painless bleeding"]
    },
    redFlags: [
      "Hematuria + unexplained weight loss (Malignancy suspicion)",
      "Painless hematuria in smokers or those >50 years",
      "Large blood clots preventing urination"
    ]
  },
  {
    id: "renal_urine_character",
    label: "Urine Character Changes",
    dimensions: {
      character: ["dark (dehydration/liver)", "foamy (proteinuria)", "cloudy (infection)", "foul-smelling"],
      volume: ["reduced output (Oliguria)", "no output (Anuria)", "excessive output (Polyuria)"]
    },
    redFlags: [
      "Anuria/Oliguria (Acute Kidney Injury concern)",
      "Foamy urine + generalized swelling (Nephrotic syndrome alert)"
    ]
  },

  // RENAL / FLANK SYMPTOMS
  {
    id: "renal_pain_flank",
    label: "Flank & Back Pain (Renal)",
    dimensions: {
      character: ["sharp/colicky (comes in waves)", "constant dull ache", "throbbing"],
      location: ["left side", "right side", "radiating to groin"],
      relief: ["cannot find a comfortable position (Colic)"]
    },
    redFlags: [
      "Severe or unbearable flank pain (Stone/Obstruction alert)",
      "Fever + flank pain (Pyelonephritis alert)",
      "Pain following trauma"
    ]
  },
  {
    id: "renal_bladder_discomfort",
    label: "Bladder & Suprapubic Pain",
    dimensions: {
      location: ["lower abdomen (above pubic bone)", "deep pelvic"],
      associated: ["pressure feeling", "relief after urinating"]
    }
  },

  // FLUID / SYSTEMIC SIGNS
  {
    id: "renal_edema_fluid",
    label: "Fluid Retention & Edema",
    dimensions: {
      location: ["puffy face (morning)", "swollen ankles/legs", "swollen eyelids"],
      associated: ["shortness of breath (fluid overload)", "sudden weight gain"]
    },
    redFlags: [
      "Edema + foamy urine",
      "Rapidly worsening shortness of breath"
    ]
  }
];

export const SKIN_MODELS: SymptomModel[] = [
  // SKIN SYMPTOMS
  {
    id: "skin_rash",
    label: "Skin Rash",
    dimensions: {
      location: ["generalized", "localized (face/trunk/limbs)", "flexural (folds)"],
      appearance: ["flat (macular)", "raised (papular)", "blistering (vesicular)", "bumpy", "scaly/peeling"],
      character: ["itchy", "painful", "burning", "numb"]
    },
    redFlags: [
      "Rapidly spreading rash + high fever (Sepsis/Meningococcemia alert)",
      "Rash with difficulty breathing or lip swelling (Anaphylaxis alert)",
      "Purple/non-blanching spots (Vasculitis/Bleeding disorder alert)",
      "Widespread skin peeling or mucosal involvement (SJS/TEN alert)"
    ]
  },
  {
    id: "skin_itching_dryness",
    label: "Itching & Dryness",
    dimensions: {
      type: ["itching (Pruritus)", "skin dryness (Xerosis)", "scaling/peeling"],
      timing: ["worse at night", "after showering", "constant"],
      context: ["new soap/detergent", "stress", "cold weather"]
    },
    redFlags: [
      "Itching associated with jaundice (yellow skin/eyes)",
      "Widespread itching with weight loss or night sweats",
      "Itching associated with a new medication"
    ]
  },
  {
    id: "skin_redness_erythema",
    label: "Skin Redness (Erythema)",
    dimensions: {
      location: ["localized/spreading", "facial (butterfly distribution)", "circular (target-like)"],
      temperature: ["warm to touch", "normal"]
    },
    redFlags: [
      "Redness spreading rapidly with severe pain and fever (Cellulitis/Necrotizing alert)",
      "Bull's-eye rash (Lyme disease suspicion)"
    ]
  },
  {
    id: "skin_lesions_ulcers",
    label: "Skin Lesions & Ulcers",
    dimensions: {
      type: ["new or changing mole", "non-healing ulcer", "skin discoloration", "blisters/vesicles"],
      character: ["bleeding/oozing", "irregular borders", "multiple colors"]
    },
    redFlags: [
      "Mole changing in size, shape, or color (Melanoma suspicion)",
      "Non-healing skin ulcer (Malignancy/Vascular disease alert)",
      "New lesion in an elderly patient or on sun-exposed area"
    ]
  },
  {
    id: "skin_bruising_petichiae",
    label: "Bruising & Sensitivity",
    dimensions: {
      character: ["easy bruising", "small red/purple dots (petichiae)", "skin sensitivity/pain"],
      location: ["generalized", "unexpected areas"]
    },
    redFlags: [
      "Extensive bruising without trauma",
      "Associated with bleeding gums or nosebleeds"
    ]
  },

  // HAIR SYMPTOMS
  {
    id: "skin_hair_loss",
    label: "Hair Symptoms",
    dimensions: {
      type: ["generalized thinning", "patchy loss (Alopecia)", "excessive shedding", "excess growth (Hirsutism)"],
      character: ["dry/brittle hair", "scarring visible on scalp"]
    },
    redFlags: [
      "Hair loss + systemic symptoms (weight change/fatigue - Endocrine alert)",
      "Sudden, rapid hair loss",
      "Excess hair growth in a female with menstrual changes"
    ]
  },

  // NAIL SYMPTOMS
  {
    id: "skin_nail_changes",
    label: "Nail Symptoms",
    dimensions: {
      character: ["brittle nails", "nail discoloration (yellow/brown)", "thickening", "pitting", "nail separation (Onycholysis)"],
      appearance: ["clubbing (rounded tips)", "Beau's lines (horizontal ridges)", "fungal infection signs"]
    },
    redFlags: [
      "Digital clubbing (Chronic heart/lung disease suspicion)",
      "Splinter hemorrhages under nails",
      "Sudden dark streak under a single nail (Subungual melanoma alert)"
    ]
  },

  // SYSTEMIC & SENSITIVITY
  {
    id: "skin_photosensitivity",
    label: "Photosensitivity & Temperature",
    dimensions: {
      sensation: ["rash after sun exposure", "easy burning", "cold/heat intolerance affecting skin"]
    },
    redFlags: [
      "Malar (butterfly) rash + joint pain (Lupus suspicion)"
    ]
  },
  {
    id: "skin_urticaria",
    label: "Hives (Urticaria)",
    dimensions: { type: ["itchy welts", "swelling (Angioedema)"], triggers: ["food", "medication", "stress", "unknown"] }
  },
  {
    id: "skin_fungal_infection",
    label: "Fungal Infection signs",
    dimensions: { location: ["feet (Athlete's foot)", "groin (Jock itch)", "nails", "trunk (Ringworm)"] }
  }
];

export const MUSCULOSKELETAL_MODELS: SymptomModel[] = [
  // JOINT SYMPTOMS
  {
    id: "msk_joint_pain",
    label: "Joint Pain (Arthralgia)",
    dimensions: {
      location: ["single joint", "multiple joints", "symmetrical", "migratory"],
      character: ["aching", "sharp", "throbbing", "stabbing"],
      timing: ["worse in morning", "worse with activity", "constant"]
    },
    redFlags: ["Sudden severe pain", "Pain following injury"]
  },
  {
    id: "msk_joint_swelling",
    label: "Joint Swelling",
    dimensions: {
      location: ["knee", "shoulder", "hip", "wrists/hands", "ankles/feet"],
      onset: ["sudden", "gradual"]
    },
    redFlags: ["Red, hot, swollen joint + fever (Septic arthritis alert)"]
  },
  {
    id: "msk_joint_stiffness",
    label: "Joint Stiffness",
    dimensions: {
      timing: ["morning stiffness > 1 hour", "morning stiffness < 30 mins", "after inactivity"],
      severity: ["prevents movement", "mildly restricts movement"]
    }
  },
  {
    id: "msk_joint_redness",
    label: "Joint Redness",
    dimensions: { associated: ["warmth", "swelling", "severe pain"] }
  },
  {
    id: "msk_joint_deformity",
    label: "Joint Deformity",
    dimensions: { type: ["crooked fingers", "bony growths/nodes", "malignment of limb"] }
  },
  {
    id: "msk_joint_instability",
    label: "Joint Instability / Giving Way",
    dimensions: { location: ["knee", "ankle", "shoulder"], associated: ["clicking", "locking", "popping"] }
  },

  // MUSCLE SYMPTOMS
  {
    id: "msk_muscle_pain",
    label: "Muscle Pain (Myalgia)",
    dimensions: {
      location: ["generalized", "localized", "proximal", "distal"],
      character: ["aching", "burning", "stiffness"]
    },
    redFlags: ["Severe pain with dark urine (Rhabdomyolysis)"]
  },
  {
    id: "msk_muscle_weakness",
    label: "Muscle Weakness",
    dimensions: {
      onset: ["sudden", "gradual"],
      location: ["shoulders/hips", "hands/feet", "unilateral", "bilateral"]
    },
    redFlags: ["Progressive weakness", "Associated with difficulty breathing"]
  },
  {
    id: "msk_muscle_cramps",
    label: "Muscle Cramps / Spasms",
    dimensions: { timing: ["at night", "during exercise", "constant"], location: ["calves", "hands", "back"] }
  },
  {
    id: "msk_muscle_twitching",
    label: "Muscle Twitching (Fasciculations)",
    dimensions: { location: ["eyelid", "thigh", "generalized"], frequency: ["intermittent", "constant"] }
  },
  {
    id: "msk_muscle_wasting",
    label: "Muscle Wasting (Atrophy)",
    dimensions: { location: ["hands", "thighs", "shoulder girdle"], symmetry: ["one side", "both sides"] }
  },

  // SPINE / BACK SYMPTOMS
  {
    id: "msk_back_pain_lower",
    label: "Lower Back Pain",
    dimensions: {
      character: ["sharp", "dull ache", "stiffness", "radiating to legs"],
      triggers: ["lifting", "sitting", "walking"]
    },
    redFlags: [
      "Loss of bowel/bladder control (Cauda Equina alert)",
      "Saddle anesthesia",
      "Nocturnal pain"
    ]
  },
  {
    id: "msk_back_pain_upper_neck",
    label: "Upper Back & Neck Pain",
    dimensions: { character: ["sharp", "stiff", "muscle knots"], location: ["neck", "between shoulder blades", "shoulders"] }
  },
  {
    id: "msk_sciatica",
    label: "Sciatica (Radiating Leg Pain)",
    dimensions: {
      location: ["buttock", "thigh", "calf", "foot"],
      character: ["electric shock", "burning", "shooting"]
    }
  },

  // EXTREMITY & FUNCTIONAL
  {
    id: "msk_limb_pain_swelling",
    label: "Limb Pain & Swelling",
    dimensions: { type: ["leg pain", "arm pain", "unilateral leg swelling", "bilateral leg swelling"] },
    redFlags: ["Sudden unilateral leg swelling (DVT risk)"]
  },
  {
    id: "msk_difficulty_walking_limping",
    label: "Difficulty Walking / Limping",
    dimensions: {
      character: ["limping", "slow gait", "unsteady", "dragged foot"],
      associated: ["pain", "weakness", "balance problems"]
    }
  },
  {
    id: "msk_movement_issues",
    label: "Difficulty Standing / Stairs",
    dimensions: { type: ["difficulty standing up from chair", "difficulty climbing stairs", "difficulty reaching overhead"] }
  },

  // TRAUMA
  {
    id: "msk_trauma_injury",
    label: "Recent Injury / Trauma",
    dimensions: { mechanism: ["fall", "sports injury", "direct blow", "overuse"], symptoms: ["deformity", "bruising", "inability to bear weight"] }
  }
];

export const NEUROLOGICAL_MODELS: SymptomModel[] = [
  // MOTOR SYMPTOMS
  {
    id: "neuro_weakness_generalized",
    label: "Generalized Weakness",
    dimensions: { onset: ["sudden", "gradual"], associated: ["fatigue", "fever", "weight loss"] }
  },
  {
    id: "neuro_weakness_focal",
    label: "Focal Weakness / Paralysis",
    dimensions: {
      location: ["one arm", "one leg", "one side of body (Hemiparesis)", "face only"],
      onset: ["sudden (minutes)", "gradual (days/weeks)"]
    },
    redFlags: ["Sudden unilateral weakness (Stroke alert)", "Associated with slurred speech"]
  },
  {
    id: "neuro_motor_coordination",
    label: "Loss of Coordination (Ataxia)",
    dimensions: { location: ["arms/hands", "legs/gait", "generalized"], associated: ["dizziness", "falls"] }
  },
  {
    id: "neuro_muscle_stiffness_twitching",
    label: "Muscle Stiffness & Twitching",
    dimensions: { type: ["rigidity/stiffness", "twitching (Fasciculations)", "tremor", "spasms"] }
  },

  // SENSORY SYMPTOMS
  {
    id: "neuro_numbness_tingling",
    label: "Numbness & Tingling (Paresthesia)",
    dimensions: {
      location: ["hands", "feet", "face", "one side of body", "glove and stocking pattern"],
      duration: ["intermittent", "constant", "with certain positions"]
    }
  },
  {
    id: "neuro_pain_burning",
    label: "Burning or Neuralgic Pain",
    dimensions: {
      character: ["burning", "electric shock-like", "sharp/stabbing", "shooting"],
      location: ["limbs", "trunk", "face (Trigeminal)"]
    }
  },
  {
    id: "neuro_sensory_loss",
    label: "Loss of Sensation",
    dimensions: { location: ["hands", "feet", "perianal (Saddle anesthesia)"], onset: ["sudden", "gradual"] }
  },

  // COGNITIVE SYMPTOMS
  {
    id: "neuro_memory_loss",
    label: "Memory Loss",
    dimensions: { type: ["short-term", "long-term", "forgetting names/places"], onset: ["sudden", "gradual"] }
  },
  {
    id: "neuro_confusion_disorientation",
    label: "Confusion & Disorientation",
    dimensions: { type: ["time", "place", "person", "new confusion"], onset: ["sudden (Delirium)", "gradual"] }
  },
  {
    id: "neuro_difficulty_concentrating",
    label: "Difficulty Concentrating (Brain Fog)",
    dimensions: { severity: ["mild", "severe", "affects work/daily life"], associated: ["fatigue", "sleep issues"] }
  },

  // BALANCE & COORDINATION
  {
    id: "neuro_dizziness_vertigo",
    label: "Dizziness & Vertigo",
    dimensions: { type: ["spinning (Vertigo)", "lightheadedness", "unsteadiness"], triggers: ["head movement", "standing up"] }
  },
  {
    id: "neuro_balance_loss",
    label: "Loss of Balance / Falls",
    dimensions: { frequency: ["recurrent falls", "near falls", "unsteadiness when walking"] }
  },

  // EPISODIC SYMPTOMS
  {
    id: "neuro_seizures",
    label: "Seizures / Convulsions",
    dimensions: { type: ["generalized (shaking)", "focal (twitching)", "absence (staring)"], frequency: ["first time", "recurrent"] },
    redFlags: ["First ever seizure", "Prolonged seizure > 5 mins (Status Epilepticus)"]
  },
  {
    id: "neuro_loss_of_consciousness",
    label: "Loss of Consciousness (Fainting)",
    dimensions: { triggers: ["standing", "pain/stress", "exercise", "none"], associated: ["palpitations", "pre-syncope (feeling faint)"] }
  },
  {
    id: "neuro_aura",
    label: "Aura Symptoms",
    dimensions: { type: ["visual (flashes/spots)", "sensory (tingling)", "speech disturbance"], duration: ["minutes", "hour"] }
  },

  // VISUAL & SPEECH
  {
    id: "neuro_speech_difficulty",
    label: "Speech Difficulty (Dysarthria/Aphasia)",
    dimensions: { type: ["slurred speech", "difficulty finding words", "cannot speak"], onset: ["sudden", "gradual"] },
    redFlags: ["Sudden slurred speech or word-finding difficulty (Stroke alert)"]
  },
  {
    id: "neuro_vision_changes_diplopia",
    label: "Double Vision (Diplopia)",
    dimensions: { onset: ["sudden", "gradual"], associated: ["headache", "jaw pain"] }
  },

  // HEADACHE SPECTRUM
  {
    id: "neuro_headache_thunderclap",
    label: "Severe Sudden Headache (Thunderclap)",
    dimensions: { severity: ["worst headache of life", "instant peak (seconds)"] },
    redFlags: ["Subarachnoid Hemorrhage concern - EMERGENCY"]
  },
  {
    id: "neuro_headache_migraine",
    label: "Migraine-type Headache",
    dimensions: { associated: ["nausea", "light sensitivity", "sound sensitivity", "aura"] }
  },
  {
    id: "neuro_headache_tension",
    label: "Tension-type Headache",
    dimensions: { character: ["band-like pressure", "bilateral", "dull ache"] }
  },

  // AUTONOMIC / SYSTEMIC NEURO
  {
    id: "neuro_autonomic_dysfunction",
    label: "Autonomic Nervous System issues",
    dimensions: { type: ["fainting episodes", "sweating abnormalities", "bladder/bowel control issues", "orthostatic dizziness"] },
    redFlags: ["Sudden loss of bowel/bladder control (Cauda Equina alert)"]
  }
];

export const GENERAL_MODELS: SymptomModel[] = [
  {
    id: "gen_fever",
    label: "Fever",
    dimensions: {
      severity: ["low-grade", "high (>103F/39.4C)", "fluctuating"],
      duration: ["acute (days)", "persistent (weeks)"],
      associated: ["shills/shivering", "sweating", "headache", "body aches"]
    },
    redFlags: ["Fever + stiff neck", "Fever in immunocompromised"]
  },
  {
    id: "gen_shaking_chills",
    label: "Shaking Chills (Rigors)",
    dimensions: { intensity: ["mild shivers", "teeth-chattering rigors"], associated: ["fever", "confusion"] }
  },
  {
    id: "gen_night_sweats",
    label: "Night Sweats",
    dimensions: { severity: ["mild dampness", "drenching (need to change clothes)"], frequency: ["occasional", "nightly"] },
    redFlags: ["Drenching sweats + weight loss"]
  },
  {
    id: "gen_fatigue",
    label: "Fatigue / Tiredness",
    dimensions: {
      severity: ["mild", "interferes with work", "unable to get out of bed"],
      relief: ["improves with rest", "unrelieved by sleep"]
    },
    redFlags: ["Sudden extreme fatigue", "Associated with shortness of breath"]
  },
  {
    id: "gen_malaise",
    label: "Malaise (General unwell feeling)",
    dimensions: { character: ["feeling 'off'", "vague illness"], associated: ["fever", "body aches"] }
  },
  {
    id: "gen_weakness_generalized",
    label: "Generalized Weakness / Lethargy",
    dimensions: { location: ["entire body", "limbs"], onset: ["sudden", "gradual"] },
    redFlags: ["Sudden inability to move limbs"]
  },
  {
    id: "gen_weight_loss",
    label: "Unintentional Weight Loss",
    dimensions: {
      amount: ["<5%", "5-10%", ">10% of body weight"],
      timeframe: ["weeks", "months"],
      appetite: ["increased", "decreased", "normal"]
    },
    redFlags: ["Rapid weight loss > 10% in 6 months"]
  },
  {
    id: "gen_weight_gain",
    label: "Unintentional Weight Gain",
    dimensions: { timeframe: ["days (fluid)", "months (fat/metabolic)"], associated: ["swelling", "shortness of breath"] }
  },
  {
    id: "gen_appetite_loss",
    label: "Loss of Appetite / Decreased Appetite",
    dimensions: { severity: ["mild", "complete refusal of food"], associated: ["nausea", "weight loss"] }
  },
  {
    id: "gen_exercise_intolerance",
    label: "Exercise Intolerance",
    dimensions: { character: ["shortness of breath", "fatigue", "muscle pain"], severity: ["mild", "severe"] }
  },
  {
    id: "gen_stamina_reduced",
    label: "Reduced Stamina / Decreased Activity",
    dimensions: { duration: ["recent", "chronic"], impact: ["ADLs", "work", "hobbies"] }
  },
  {
    id: "gen_chronic_fatigue",
    label: "Chronic Fatigue",
    dimensions: { duration: ["> 6 months"], impact: ["severe neurocognitive issues", "unrefreshing sleep"] }
  },
  {
    id: "gen_dehydration_symptoms",
    label: "Dehydration Symptoms",
    dimensions: { character: ["dry mouth", "extreme thirst", "dark urine", "dizziness"] }
  },
  {
    id: "gen_dizziness_general",
    label: "Dizziness (General/Systemic)",
    dimensions: { character: ["lightheadedness", "faintness", "room spinning"] }
  },
  {
    id: "gen_syncope_feeling",
    label: "Syncope-like Feeling (Near Fainting)",
    dimensions: { triggers: ["standing quickly", "prolonged standing", "dehydration"] }
  },
  {
    id: "gen_brain_fog",
    label: "Brain Fog / Reduced Concentration",
    dimensions: { character: ["forgetfulness", "mental fatigue", "confusion"] }
  },
  {
    id: "gen_recurrent_infections",
    label: "Recurrent Infections",
    dimensions: { frequency: ["multiple times per year"], type: ["respiratory", "urinary", "skin"] }
  },
  {
    id: "gen_poor_wound_healing",
    label: "Poor Wound Healing",
    dimensions: { location: ["feet", "generalized"], associated: ["skin infections", "diabetes history"] }
  },
  {
    id: "gen_sleep_disturbance",
    label: "Sleep Disturbance / Insomnia",
    dimensions: { type: ["difficulty falling asleep", "waking up", "restless sleep"] }
  },
  {
    id: "gen_daytime_sleepiness",
    label: "Daytime Sleepiness / Irritability",
    dimensions: { severity: ["mild", "severe/nodding off"] }
  },
  {
    id: "gen_body_aches_generalized",
    label: "Generalized Body Aches",
    dimensions: { character: ["flu-like", "muscle soreness", "joint discomfort"] }
  }
];

export const MALE_MODELS: SymptomModel[] = [
  // SEXUAL FUNCTION
  {
    id: "male_erectile_dysfunction",
    label: "Erections, Difficulty with (ED)",
    dimensions: {
      onset: ["gradual", "sudden", "after starting medication"],
      timing: ["constant", "only in certain situations", "loss of morning erections"],
      associated: ["decreased libido", "anxiety", "stress"]
    },
    redFlags: [
      "Sudden onset after trauma to pelvis or spine",
      "Associated with sudden leg weakness",
      "Associated with new urinary incontinence"
    ]
  },
  {
    id: "male_libido_decreased",
    label: "Decreased Libido (Sex Drive)",
    dimensions: {
      duration: ["recent change", "long-standing"],
      associated: ["fatigue", "mood changes", "erectile dysfunction", "weight changes"]
    }
  },
  {
    id: "male_ejaculation_issues",
    label: "Ejaculation issues (Premature/Delayed)",
    dimensions: {
      type: ["premature ejaculation", "delayed ejaculation", "inability to ejaculate (Anorgasmia)"],
      associated: ["pain during ejaculation", "blood in semen (Hematospermia)"]
    },
    redFlags: [
      "Painful ejaculation with fever",
      "Repeated blood in semen in men over 50"
    ]
  },

  // TESTICULAR & SCROTAL
  {
    id: "male_testicular_pain",
    label: "Testicular Pain",
    dimensions: {
      onset: ["sudden (Severe)", "gradual ache"],
      location: ["left side", "right side", "both"],
      associated: ["swelling", "nausea", "fever", "abdominal pain"]
    },
    redFlags: [
      "Sudden severe pain (Testicular Torsion ER alert)",
      "Pain with nausea and vomiting",
      "Pain following trauma",
      "High fever and scrotal redness"
    ],
    requiredExams: [
      "Checking for Prehn's sign",
      "Testing cremasteric reflex",
      "Palpation for testicular masses/hard nodules",
      "Transillumination of scrotum"
    ]
  },
  {
    id: "male_testicular_swelling_mass",
    label: "Testicular Swelling or Mass",
    dimensions: {
      type: ["painless lump/mass", "general scrotal swelling", "heaviness in scrotum", "fluid feeling (Hydrocele)"],
      onset: ["gradual", "sudden"]
    },
    redFlags: [
      "Painless firm lump within the testicle (Germ cell tumor concern)",
      "Rapidly increasing size",
      "Associated with weight loss"
    ]
  },
  {
    id: "male_scrotal_skin_changes",
    label: "Scrotal Skin Changes",
    dimensions: {
      type: ["redness/warmth", "itching", "sores/ulcers", "peeling"],
      associated: ["pain", "discharge"]
    },
    redFlags: [
      "Rapidly spreading redness and extreme pain (Fournier's Gangrene emergency)",
      "Painless ulcers (Syphilis screening)"
    ]
  },

  // PENILE SYMPTOMS
  {
    id: "male_penile_discharge",
    label: "Penile Discharge",
    dimensions: {
      character: ["clear", "pus-like (purulent)", "bloody", "watery"],
      associated: ["pain with urination", "itching/burning"],
      timing: ["worse in morning", "constant"]
    },
    redFlags: [
      "Discharge + fever + joint pain (Disseminated gonorrhea alert)",
      "Heavy bleeding from urethra"
    ]
  },
  {
    id: "male_penile_lesions",
    label: "Penile Lesions / Ulcers",
    dimensions: {
      type: ["painful sores", "painless ulcers", "blisters", "wart-like growths"],
      associated: ["swollen lymph nodes in groin"]
    },
    redFlags: [
      "Painless ulcer (Chancre suspicion)",
      "Clustered painful blisters (Herpes suspicion)"
    ]
  },
  {
    id: "male_penile_pain_swelling",
    label: "Penile Pain & Swelling",
    dimensions: {
      type: ["pain with erection", "curvature (Peyronie's)", "foreskin swelling (Phimosis/Paraphimosis)", "priapism (persistent erection)"],
      associated: ["trauma during intercourse"]
    },
    redFlags: [
      "Priapism (erection lasting > 4 hours) - Emergency",
      "Inability to pull foreskin forward over glans (Paraphimosis) - Emergency",
      "Sudden 'snap' and pain during intercourse (Penile fracture) - Emergency"
    ]
  },

  // URINARY FLOW
  {
    id: "male_urinary_flow_issues",
    label: "Urinary Flow & Prostate Issues",
    dimensions: {
      character: ["weak stream", "starting delay (Hesitancy)", "nocturnal frequency", "dribbling"]
    },
    redFlags: [
      "Complete inability to urinate (Acute retention)",
      "Visible blood in urine (Hematuria)",
      "Severe lower back pain"
    ]
  },

  // INFERTILITY & HORMONAL
  {
    id: "male_infertility",
    label: "Infertility / Conception issues",
    dimensions: {
      duration: ["trying for > 12 months", "trying for 6-12 months"],
      associated: ["history of mumps", "history of undescended testicle", "varicocele (bag of worms feeling)"]
    }
  },
  {
    id: "male_hormonal_symptoms",
    label: "Hormonal Imbalance signs (Male)",
    dimensions: {
      symptoms: ["breast enlargement (Gynecomastia)", "reduced facial/body hair", "decreased muscle mass", "increased body fat"],
      associated: ["fatigue", "mood changes"]
    },
    redFlags: [
      "Rapid breast enlargement",
      "Loss of secondary male characteristics"
    ]
  }
];

export const FEMALE_MODELS: SymptomModel[] = [
  // MENSTRUAL SYMPTOMS
  {
    id: "female_amenorrhea",
    label: "Absent periods (Amenorrhea)",
    dimensions: {
      type: ["primary (never started)", "secondary (stopped after having them)"],
      associated: ["pregnancy suspicion", "excessive exercise", "significant weight loss", "stress"]
    },
    redFlags: ["Sudden cessation with severe abdominal pain", "Galactorrhea (milky discharge)"]
  },
  {
    id: "female_menorrhagia",
    label: "Heavy Menstrual Bleeding (Menorrhagia)",
    dimensions: {
      severity: ["soaking through pads/tampons in 1 hour", "passing large clots", "anemia symptoms (fatigue)"],
      duration: ["periods lasting > 7 days", "intermittent"]
    },
    redFlags: ["Postmenopausal bleeding", "Bleeding with signs of shock (dizziness/fainting)"]
  },
  {
    id: "female_irregular_periods",
    label: "Irregular Menstrual Cycles",
    dimensions: {
      pattern: ["infrequent (Oligomenorrhea)", "too frequent (Polymenorrhea)", "bleeding between periods (Metrorrhagia)", "variable cycle length"],
      associated: ["acne", "excess hair growth (Hirsutism)", "PMS symptoms"]
    }
  },
  {
    id: "female_dysmenorrhea",
    label: "Painful periods (Dysmenorrhea)",
    dimensions: {
      onset: ["primary (started with first periods)", "secondary (started later in life/worsening)"],
      severity: ["prevents school/work", "mild/crampy"]
    },
    redFlags: ["Severe pain not responding to usual over-the-counter meds"]
  },
  {
    id: "female_pms",
    label: "Premenstrual Syndrome (PMS)",
    dimensions: {
      symptoms: ["mood swings", "irritability", "bloating", "breast tenderness", "cravings"],
      timing: ["starts 1-2 weeks before period", "resolves after period starts"]
    }
  },

  // PREGNANCY RELATED
  {
    id: "female_missed_period",
    label: "Missed Period",
    dimensions: {
      duration: ["1 missed cycle", "2+ missed cycles"],
      pregnancy_test: ["positive", "negative", "not done"]
    },
    redFlags: ["Missed period + severe sharp pelvic pain (Ectopic suspicion)"]
  },
  {
    id: "female_morning_sickness",
    label: "Morning Sickness (Nausea/Vomiting)",
    dimensions: {
      severity: ["mild nausea", "occasional vomiting", "unable to keep fluids down (Hyperemesis)"],
      timing: ["morning and evening", "all day"]
    }
  },
  {
    id: "female_pregnancy_fatigue",
    label: "Fatigue (likely pregnancy related)",
    dimensions: {
      associated: ["breast tenderness", "missed period", "increased urination"]
    }
  },

  // VAGINAL SYMPTOMS
  {
    id: "female_vaginal_discharge",
    label: "Vaginal Discharge",
    dimensions: {
      character: ["clear/leukorrhea", "white/clumpy (yeast)", "yellow/green", "foul-smelling", "bloody/brown"],
      associated: ["itching", "burning", "odor"]
    }
  },
  {
    id: "female_vaginal_bleeding_abnormal",
    label: "Abnormal Vaginal Bleeding",
    dimensions: {
      type: ["postcoital (after intercourse)", "spotting between periods", "postmenopausal bleeding"],
      associated: ["pelvic pain", "trauma"]
    },
    redFlags: [
      "Postmenopausal bleeding (Malignancy screening alert)",
      "Bleeding after intercourse",
      "Very heavy bleeding with dizziness"
    ]
  },
  {
    id: "female_vaginal_dryness",
    label: "Vaginal Dryness / Itching",
    dimensions: {
      sensation: ["dryness", "itching", "burning during/after intercourse"],
      triggers: ["menopause transition", "postpartum", "new soaps/products"]
    }
  },

  // PELVIC SYMPTOMS
  {
    id: "female_pelvic_pain",
    label: "Pelvic Pain",
    dimensions: {
      character: ["aching", "sharp/stabbing", "chronic pelvic pain", "sudden onset"],
      timing: ["cyclical (with periods)", "random", "with bowel movements"]
    },
    redFlags: [
      "Severe pelvic pain + fever + discharge (PID concern)",
      "Sudden severe pain in pregnancy",
      "Suspected ovarian torsion (sudden severe pain with nausea)"
    ],
    requiredExams: [
      "Perform bimanual pelvic examination",
      "Assess for cervical motion tenderness",
      "Abdominal palpation for masses"
    ]
  },
  {
    id: "female_dyspareunia",
    label: "Pain during Intercourse (Dyspareunia)",
    dimensions: {
      location: ["superficial (at entry)", "deep (inside)"],
      associated: ["vaginal dryness", "pelvic pain", "bleeding after"]
    }
  },
  {
    id: "female_pelvic_pressure",
    label: "Pelvic Pressure sensation",
    dimensions: {
      character: ["feeling like something is 'falling out'", "heaviness", "fullness"],
      associated: ["urinary leakage", "constipation", "visible bulge at vagina (Prolapse)"]
    }
  },

  // BREAST SYMPTOMS
  {
    id: "female_breast_pain",
    label: "Breast Pain (Mastalgia)",
    dimensions: {
      type: ["cyclical (worse before period)", "non-cyclical", "sharp/burning"],
      location: ["one breast", "both breasts", "specific area"]
    }
  },
  {
    id: "female_breast_lump",
    label: "Breast Lump",
    dimensions: {
      character: ["hard/fixed", "soft/rubbery", "painful", "painless"],
      location: ["upper outer quadrant", "near nipple", "axilla (armpit)"]
    },
    redFlags: [
      "Hard, fixed, painless lump",
      "Skin changes like 'orange peel' (Peau d'orange)",
      "New nipple retraction or turning inward"
    ]
  },
  {
    id: "female_nipple_discharge",
    label: "Nipple Discharge",
    dimensions: {
      character: ["milky (Galactorrhea)", "clear", "bloody", "yellow/green"],
      onset: ["spontaneous", "only when squeezed"]
    },
    redFlags: ["Bloody discharge", "Spontaneous discharge in 1 breast only"]
  },
  {
    id: "female_breast_swelling_tenderness",
    label: "Breast Swelling & Tenderness",
    dimensions: {
      timing: ["hormonal cycle", "pregnancy", "breastfeeding (assess for Mastitis)"],
      redness: ["present (Mastitis concern)", "absent"]
    },
    redFlags: ["Hot, red, painful breast with fever (Mastitis/Abscess concern)"]
  },

  // FERTILITY & HORMONAL
  {
    id: "female_infertility",
    label: "Infertility / Conception issues",
    dimensions: {
      duration: ["trying for > 12 months (age <35)", "trying for > 6 months (age >35)"],
      associated: ["irregular periods", "history of STIs/PID"]
    }
  },
  {
    id: "female_hirsutism_hormonal",
    label: "Excess Hair / Hormonal changes",
    dimensions: {
      type: ["excess facial/body hair (Hirsutism)", "oily skin/acne", "hair thinning on head"],
      associated: ["weight gain", "clitoral enlargement (Virilization signs)"]
    }
  }
];

export const ENDOCRINE_MODELS: SymptomModel[] = [
  // WEIGHT & METABOLIC
  {
    id: "endo_weight_gain",
    label: "Unintentional Weight Gain",
    dimensions: {
      timeframe: ["rapid (weeks)", "steady (months)"],
      associated: ["increased appetite", "difficulty losing weight", "fatigue", "swelling/edema"]
    }
  },
  {
    id: "endo_weight_loss",
    label: "Unintentional Weight Loss (Endocrine)",
    dimensions: {
      appetite: ["increased (Polyphagia)", "decreased", "normal"],
      associated: ["palpitations", "anxiety", "increased thirst"]
    },
    redFlags: ["Weight loss despite increased appetite"]
  },
  {
    id: "endo_appetite_changes",
    label: "Appetite Changes (Metabolic)",
    dimensions: { type: ["frequent hunger (Polyphagia)", "decreased appetite", "cravings"] }
  },

  // TEMPERATURE REGULATION
  {
    id: "endo_heat_intolerance",
    label: "Heat Intolerance",
    dimensions: { associated: ["excessive sweating", "palpitations", "anxiety"] }
  },
  {
    id: "endo_cold_intolerance",
    label: "Cold Intolerance",
    dimensions: { associated: ["dry skin", "constipation", "fatigue", "weight gain"] }
  },
  {
    id: "endo_sweating_abnormalities",
    label: "Sweating abnormalities",
    dimensions: { type: ["excessive sweating (Hyperhidrosis)", "decreased sweating", "night sweats"] }
  },

  // FLUID & GLUCOSE
  {
    id: "endo_thirst_polydipsia",
    label: "Excessive Thirst (Polydipsia)",
    dimensions: { onset: ["sudden", "insidious"], associated: ["dry mouth", "frequent urination"] }
  },
  {
    id: "endo_urination_polyuria",
    label: "Excessive Urination (Polyuria)",
    dimensions: { timing: ["all day", "mostly at night (Nocturia)"], character: ["large volumes", "frequent but small"] }
  },
  {
    id: "endo_dehydration_symptoms",
    label: "Dehydration symptoms",
    dimensions: { type: ["dizziness on standing", "dry membranes", "dark urine"] }
  },

  // NEUROMETABOLIC
  {
    id: "endo_fatigue_weakness",
    label: "Fatigue & Weakness (Endocrine)",
    dimensions: { character: ["lethargy", "muscle weakness (proximal)", "brain fog", "poor concentration"] }
  },
  {
    id: "endo_mood_changes",
    label: "Hormonal Mood Changes",
    dimensions: { type: ["irritability", "anxiety", "emotional lability", "depression symptoms"] }
  },

  // SKIN & BODY CHANGES
  {
    id: "endo_skin_hair_changes",
    label: "Skin & Hair (Endocrine)",
    dimensions: { 
      type: ["dry skin", "oily skin", "hair loss", "excess body hair (Hirsutism)", "brittle hair/nails", "pigmentation changes"],
      associated: ["acne worsening"]
    }
  },

  // CARDIO & GROWTH
  {
    id: "endo_cardio_endocrine",
    label: "Cardiometabolic (Palpitations/HR)",
    dimensions: { type: ["palpitations", "fast heart rate (Tachycardia)", "slow heart rate (Bradycardia)", "flushing"] }
  },
  {
    id: "endo_growth_hormonal",
    label: "Growth & Physical changes",
    dimensions: { type: ["delayed growth (child)", "excess growth features (Acromegaly)", "breast discharge (Galactorrhea)", "thyroid swelling (Goiter)"] },
    redFlags: ["Rapid neck swelling", "Double vision or visual field loss with hormonal changes"]
  }
];

export const HEMATOLOGIC_MODELS: SymptomModel[] = [
  // BLEEDING & BRUISING
  {
    id: "hema_bruising_easy",
    label: "Easy Bruising",
    dimensions: { context: ["after minor trauma", "spontaneous", "multiple areas"], size: ["small spots", "large patches"] }
  },
  {
    id: "hema_bleeding_excessive",
    label: "Excessive or Prolonged Bleeding",
    dimensions: { type: ["minor cuts taking long to stop", "nosebleeds (epistaxis)", "gum bleeding", "heavy periods"], severity: ["requires clinical intervention", "frequent"] }
  },
  {
    id: "hema_skin_bleeding_signs",
    label: "Skin Bleeding signs (Petechiae/Purpura)",
    dimensions: { type: ["tiny red spots (Petechiae)", "purple patches (Purpura)", "skin hemorrhages"] },
    redFlags: ["Sudden generalized petechiae (Platelet emergency alert)"]
  },

  // ANEMIA RELATED
  {
    id: "hema_anemia_symptoms",
    label: "Anemia Symptoms (Fatigue/Pallor)",
    dimensions: { character: ["fatigue", "weakness", "dizziness", "shortness of breath on exertion", "pale skin (pallor)", "palpitations"] }
  },

  // LYMPHATIC
  {
    id: "hema_lymphadenopathy",
    label: "Swollen Lymph Nodes (Lymphadenopathy)",
    dimensions: {
      location: ["neck", "armpit (axilla)", "groin (inguinal)", "generalized"],
      character: ["painful/tender", "painless", "firm/hard", "movable", "fixed/matted"],
      duration: ["recent", "persisting > 4 weeks"]
    },
    redFlags: ["Firm, painless, fixed nodes", "Generalized enlargement", "Persistent enlargement > 1 month"]
  },

  // CLOTTING & THROMBOTIC
  {
    id: "hema_clotting_clues",
    label: "Clotting clues (DVT/PE suspicion)",
    dimensions: { type: ["painful swollen leg", "sudden chest pain + dyspnea (PE)", "history of blood clots"], associated: ["limb redness", "warmth"] },
    redFlags: ["Sudden unilateral leg swelling", "Severe chest pain + shortness of breath"]
  },

  // MALIGNANCY CLUES
  {
    id: "hema_systemic_malignancy",
    label: "Systemic Malignancy clues",
    dimensions: { character: ["unexplained weight loss", "persistent fever", "night sweats", "bone pain", "abdominal fullness (Splenomegaly)"] }
  }
];

export const PSYCHIATRIC_MODELS: SymptomModel[] = [
  // MOOD SYMPTOMS
  {
    id: "psych_depression",
    label: "Depression / Low Mood",
    dimensions: {
      character: ["constant low mood", "loss of interest (Anhedonia)", "feelings of hopelessness", "guilt/worthlessness", "tearfulness"],
      duration: ["weeks", "months", "recurrent"]
    }
  },
  {
    id: "psych_mania_elevated",
    label: "Elevated Mood (Mania)",
    dimensions: { character: ["racing thoughts", "decreased need for sleep", "grandiosity", "excessive energy", "impulsivity"] }
  },
  {
    id: "psych_mood_instability",
    label: "Mood Swings & Irritability",
    dimensions: { character: ["mood swings", "emotional instability", "irritability", "anger outbursts"] }
  },

  // ANXIETY SYMPTOMS
  {
    id: "psych_anxiety_general",
    label: "Anxiety & Worry",
    dimensions: { type: ["excessive worry", "feeling on edge", "restlessness", "social anxiety", "specific phobias"] }
  },
  {
    id: "psych_panic_attacks",
    label: "Panic Attacks",
    dimensions: { associated: ["palpitations", "shortness of breath", "fear of dying", "sweating", "trembling"] }
  },

  // COGNITIVE & THOUGHT
  {
    id: "psych_cognitive_psych",
    label: "Cognitive Psych symptoms",
    dimensions: { type: ["poor concentration", "confusion (non-organic)", "disorganized thinking", "memory issues"] }
  },

  // SLEEP
  {
    id: "psych_sleep_disturbance",
    label: "Sleep Disturbance",
    dimensions: { type: ["difficulty falling asleep (Insomnia)", "frequent awakening", "nightmares", "excessive sleep (Hypersomnia)"] }
  },

  // BEHAVIORAL
  {
    id: "psych_behavioral_changes",
    label: "Behavioral Changes",
    dimensions: {
      character: ["agitation", "withdrawal from social activity", "loss of motivation", "aggressive behavior", "impulsivity"],
      risk: ["risk-taking behavior", "lack of insight"]
    },
    redFlags: [
      "Severe agitation with risk to others",
      "Acute withdrawal and isolation in a normally social person"
    ]
  },

  // PSYCHOTIC
  {
    id: "psych_psychotic_symptoms",
    label: "Psychotic Symptoms",
    dimensions: {
      type: ["hallucinations (auditory/visual)", "delusions (fixed false beliefs)", "paranoia", "loss of reality testing"],
      speech: ["disorganized speech"]
    },
    redFlags: [
      "Command hallucinations (voices telling you to do things)",
      "Acute psychosis (first break)",
      "Paranoia leading to aggressive behavior"
    ]
  },

  // RISK & SOMATIC
  {
    id: "psych_risk_assessment",
    label: "Risk & Self-Harm Symptoms",
    dimensions: {
      type: ["suicidal thoughts/ideation", "self-harm behavior (cutting/burning)", "homicidal ideation"],
      intent: ["active plan", "passive thoughts", "no plan"]
    },
    redFlags: [
      "Active suicidal plan or preparation",
      "Active homicidal ideation with a target",
      "History of impulsive dangerous behavior"
    ]
  },
  {
    id: "psych_somatic_symptoms",
    label: "Somatic & Body-related Symptoms",
    dimensions: {
      character: ["unexplained physical complaints", "fatigue without organic cause", "psychosomatic pain", "sexual dysfunction"],
      appetite: ["increased appetite", "decreased appetite", "no change"]
    }
  }
];

export const IMMUNOLOGIC_MODELS: SymptomModel[] = [
  // ALLERGIC REACTIONS (GENERAL & SKIN)
  {
    id: "immuno_allergic_skin",
    label: "Allergic Skin Reactions",
    dimensions: {
      type: ["hives (Urticaria)", "swelling (Angioedema)", "itching (Pruritus)", "red skin/rash", "Eczema flare", "Contact dermatitis"],
      location: ["face/lips", "limbs", "trunk", "whole body"],
      triggers: ["food", "medication", "insect sting", "topical contact (latex/fragrance)", "unknown"]
    },
    redFlags: [
      "Rapidly spreading hives after exposure",
      "Swelling of the lips, tongue, or face",
      "Skin reaction associated with difficulty breathing",
      "Severe, blistering rash after starting new medication"
    ]
  },

  // RESPIRATORY ALLERGIC SYMPTOMS
  {
    id: "immuno_allergic_rhinitis",
    label: "Allergic Rhinitis (Hay Fever)",
    dimensions: {
      symptoms: ["runny nose", "nasal congestion", "sneezing after exposure", "postnasal drip", "itchy nose"],
      triggers: ["seasonal (pollen)", "animal dander", "dust", "perfumes/smoke"]
    }
  },
  {
    id: "immuno_allergic_cough_wheezing",
    label: "Allergic Cough & Wheezing",
    dimensions: {
      character: ["dry allergic cough", "wheezing after exposure", "shortness of breath", "chest tightness"],
      onset: ["immediate after contact", "delayed"]
    },
    redFlags: ["Severe shortness of breath", "Rapidly worsening wheezing"]
  },

  // EYE ALLERGIC SYMPTOMS
  {
    id: "immuno_allergic_conjunctivitis",
    label: "Allergic Eye Symptoms",
    dimensions: {
      character: ["itchy eyes", "red eyes", "watery eyes", "eyelid swelling"],
      associated: ["light sensitivity (Photophobia)", "sneezing"]
    }
  },

  // FOOD & DRUG ALLERGY
  {
    id: "immuno_food_drug_allergy",
    label: "Food & Drug Allergy Symptoms",
    dimensions: {
      gastric: ["nausea", "vomiting", "abdominal cramps/pain"],
      local: ["lip/tongue swelling", "tingling in mouth", "throat tightness/hoarseness"],
      onset: ["immediate (within minutes)", "delayed (hours)"]
    },
    redFlags: [
      "Sudden difficulty breathing or swallowing (Anaphylaxis emergency)",
      "Drop in blood pressure (fainting, dizziness)",
      "Weak, rapid pulse + generalized rash"
    ]
  },

  // SYSTEMIC / ANAPHYLAXIS HISTORY
  {
    id: "immuno_anaphylaxis_history",
    label: "Anaphylaxis History",
    dimensions: {
      previous_reactions: ["known anaphylaxis history", "previous severe swelling", "multiple system involvement"],
      known_triggers: ["peanuts/nuts", "shellfish", "NSAIDs", "Penicillin", "bee stings"]
    },
    redFlags: [
      "Active reaction with multi-system involvement (e.g., skin + breathing)",
      "Rapid onset of symptoms (seconds to minutes)"
    ]
  },

  // AUTOIMMUNE / INFLAMMATORY
  {
    id: "immuno_autoimmune_patterns",
    label: "Autoimmune & Inflammatory Patterns",
    dimensions: {
      symptoms: ["recurrent joint inflammation", "morning stiffness > 1 hour", "malar (butterfly) rash", "photosensitivity rash"],
      associated: ["chronic fatigue", "unexplained fevers", "weight loss", "kidney issues (foamy urine)"]
    },
    redFlags: [
      "Vision changes or eye pain (Uveitis suspicion)",
      "Systemic flare associated with high fever",
      "Kidney involvement symptoms (edema/foamy urine)"
    ]
  },

  // IMMUNE DYSFUNCTION / DEFICIENCY
  {
    id: "immuno_deficiency_dysfunction",
    label: "Immune Deficiency & Dysfunction",
    dimensions: {
      character: ["recurrent infections (pneumonia/sinus)", "frequent colds", "slow recovery", "opportunistic infections", "poor wound healing"],
      frequency: ["multiple antibiotic courses per year", "frequent hospitalizations for infection"]
    },
    redFlags: [
      "Persistent or unusually severe infections",
      "Infection with unusual organisms",
      "Failure to thrive in children paired with recurrent infections"
    ]
  }
];

export const PEDIATRIC_MODELS: SymptomModel[] = [
  {
    id: "ped_growth_delay",
    label: "Growth or Height Delay",
    dimensions: {
      onset: ["infancy", "preschool", "school age"],
      associated: ["poor appetite", "developmental delay", "weight plateaus"]
    },
    redFlags: [
      "Failure to thrive (crossing 2+ percentile lines down)",
      "Unexplained chronic diarrhea",
      "Dysmorphic features"
    ]
  },
  {
    id: "ped_fussy_infant",
    label: "Excessive Crying / Fussiness (Infant)",
    dimensions: {
      timing: ["evening (colic pattern)", "after feeding", "constant"],
      associated: ["fever", "vomiting", "diarrhea", "rash"]
    },
    redFlags: [
      "Bulging fontanelle",
      "Inconsolable crying for > 2 hours",
      "Lethargy or poor feeding"
    ]
  }
];

export const GERIATRIC_MODELS: SymptomModel[] = [
  {
    id: "geri_fall_risk",
    label: "Frequent Falls / Instability",
    dimensions: {
      triggers: ["turning head", "getting up", "walking at night", "unknown"],
      associated: ["dizziness", "vision changes", "medication use"]
    },
    redFlags: [
      "Falls resulting in head injury",
      "Syncope (passing out)",
      "Sudden inability to walk"
    ]
  },
  {
    id: "geri_cognitive_decline",
    label: "Cognitive Decline / Confusion",
    dimensions: {
      onset: ["sudden (Delirium concern)", "gradual (Dementia concern)"],
      type: ["short-term memory", "orientation", "language", "hallucinations"]
    },
    redFlags: [
      "Sudden onset with fever (Infection risk)",
      "Wandering and getting lost",
      "Aggressive behavior"
    ]
  }
];

export const ALL_MODELS: Record<string, SymptomModel[]> = {
  general: GENERAL_MODELS,
  pediatric: PEDIATRIC_MODELS,
  head: HEAD_MODELS,
  ear: EAR_MODELS,
  eye: EYE_MODELS,
  throat: THROAT_MODELS,
  back: BACK_MODELS,
  lungs: LUNGS_MODELS,
  heart: HEART_MODELS,
  digestive: DIGESTIVE_MODELS,
  kidney: KIDNEY_MODELS,
  male: MALE_MODELS,
  female: FEMALE_MODELS,
  skin: SKIN_MODELS,
  musculoskeletal: MUSCULOSKELETAL_MODELS,
  neurological: NEUROLOGICAL_MODELS,
  geriatric: GERIATRIC_MODELS,
  endocrine: ENDOCRINE_MODELS,
  hematologic: HEMATOLOGIC_MODELS,
  psychiatric: PSYCHIATRIC_MODELS,
  immunologic: IMMUNOLOGIC_MODELS,
};
