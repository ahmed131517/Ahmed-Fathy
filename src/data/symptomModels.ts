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
    id: "scalp_pain",
    label: "Scalp Pain",
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
    id: "scalp_tenderness",
    label: "Scalp Tenderness",
    dimensions: {
      location: ["temples", "vertex", "occipital", "generalized"],
      character: ["sensitive to light touch", "soreness", "allodynia"],
      triggers: ["combing hair", "resting head on pillow"]
    },
    redFlags: [
      "Temporal artery tenderness or prominence",
      "Associated visual loss or double vision",
      "Systemic fever and weight loss"
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
    id: "facial_drooping",
    label: "Facial Drooping",
    dimensions: {
      onset: ["sudden (minutes)", "over hours/days"],
      location: ["lower face", "entire one side of face"],
      associated: ["inability to close eye", "drooling", "slurred speech"]
    },
    redFlags: [
      "Sudden onset (Stroke alert)",
      "Associated arm/leg weakness",
      "Difficulty understanding speech"
    ]
  },
  {
    id: "facial_asymmetry",
    label: "Facial Asymmetry",
    dimensions: {
      onset: ["sudden", "gradual"],
      location: ["one side of face", "mouth corner", "eyelid"],
      associated: ["unequal smile", "asymmetric brow furrow"]
    },
    redFlags: [
      "Focal neurological deficits",
      "Sudden onset with slurred speech"
    ]
  },
  {
    id: "facial_numbness",
    label: "Facial Numbness",
    dimensions: {
      location: ["lips", "cheek", "forehead", "one side", "bilateral"],
      onset: ["sudden", "gradual", "intermittent"]
    },
    redFlags: [
      "Sudden onset (Stroke / TIA concern)",
      "Associated focal weakness",
      "Difficulty swallowing or speaking"
    ]
  },
  {
    id: "facial_tingling",
    label: "Facial Tingling",
    dimensions: {
      location: ["perioral", "cheek", "one side", "patchy"],
      character: ["pins and needles", "crawling sensation"]
    },
    redFlags: [
      "Spreading to neck or arm",
      "Associated with sudden weakness or vision changes"
    ]
  },
  {
    id: "facial_twitching",
    label: "Facial Twitching",
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
    id: "facial_muscle_spasms",
    label: "Facial Muscle Spasms",
    dimensions: {
      location: ["hemifacial", "jaw muscles", "around eye"],
      character: ["involuntary contraction", "tightness", "cramping"]
    },
    redFlags: [
      "Trismus / inability to open mouth",
      "Spasms with neck rigidity"
    ]
  },
  {
    id: "jaw_pain",
    label: "Jaw Pain",
    dimensions: {
      location: ["jaw joint", "radiating to ear", "mandible", "temples"],
      character: ["clicking", "popping", "lockjaw", "aching", "sharp"],
      triggers: ["chewing", "yawning", "stress/clenching"]
    },
    redFlags: [
      "Inability to open mouth",
      "Severe swelling in the jaw area",
      "Jaw pain associated with chest pressure (Heart alert)"
    ]
  },
  {
    id: "neck_pain",
    label: "Neck Pain",
    dimensions: {
      onset: ["sudden", "after injury", "gradual"],
      character: ["dull ache", "sharp", "stiff"],
      radiation: ["to shoulders", "down arms", "to occiput"]
    },
    redFlags: [
      "Neck pain with fever and severe headache",
      "Weakness/numbness in arms or hands",
      "Pain following high-energy trauma"
    ]
  },
  {
    id: "neck_stiffness",
    label: "Neck Stiffness",
    dimensions: {
      severity: ["mild tightness", "unable to touch chin to chest"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Nuchal rigidity with fever and photophobia (Meningitis concern)",
      "Altered mental status"
    ]
  },
  {
    id: "neck_swelling",
    label: "Neck Swelling",
    dimensions: {
      location: ["diffuse", "anterior neck", "lateral neck"],
      onset: ["rapid", "gradual"]
    },
    redFlags: [
      "Airway compromise / stridor",
      "Difficulty swallowing or breathing"
    ]
  },
  {
    id: "neck_mass",
    label: "Neck Mass",
    dimensions: {
      location: ["front of neck", "sides of neck", "under jaw", "supraclavicular"],
      character: ["hard/fixed", "soft/rubbery", "tender", "painless"],
      mobility: ["moves with swallowing", "fixed to tissue"]
    },
    redFlags: [
      "Rapidly growing lump",
      "Hard, painless, fixed node",
      "Supraclavicular mass",
      "Persistent hoarseness"
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
    label: "Tinnitus",
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
    id: "ear_fullness",
    label: "Ear Fullness",
    dimensions: {
      sensation: ["clogged feeling", "blocked ear", "muffled sensation"],
      triggers: ["after swimming", "during/after a cold", "altitude changes"],
      relief: ["improves with yawning/popping", "constant"]
    },
    redFlags: [
      "Persistent fullness in one ear only",
      "Associated with sudden hearing loss"
    ]
  },
  {
    id: "ear_pressure",
    label: "Ear Pressure",
    dimensions: {
      location: ["deep ear", "behind eardrum", "bilateral"],
      triggers: ["barotrauma/flying", "diving", "nasal congestion"],
      relief: ["valsalva maneuver", "decongestants", "spontaneous"]
    },
    redFlags: [
      "Severe pain with severe pressure after barotrauma",
      "Eardrum perforation concern"
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
    id: "ear_itching",
    label: "Ear Itching",
    dimensions: {
      severity: ["mild bothersome", "intense itching"],
      location: ["outer ear canal", "auricle"],
      associated: ["dry skin/flaking", "frequent cotton swab use"]
    },
    redFlags: [
      "Spreading redness to pinna or face"
    ]
  },
  {
    id: "ear_irritation",
    label: "Ear Irritation",
    dimensions: {
      character: ["soreness", "burning sensation", "raw feeling"],
      triggers: ["hearing aids", "earbuds", "water exposure", "topical drops"]
    },
    redFlags: [
      "Severe swelling closing the ear canal",
      "Spreading cellulitis"
    ]
  },
  {
    id: "ear_foreign_body_sensation",
    label: "Foreign Body Sensation in the Ear",
    dimensions: {
      onset: ["sudden (known object/insect)", "vague sensation"],
      associated: ["hearing loss", "pain", "movement/buzzing (insect)"]
    },
    redFlags: [
      "Bleeding from the ear canal",
      "Button battery suspicion (immediate emergency)",
      "Severe pain or sudden deafness"
    ]
  },
  {
    id: "ear_noise_sensitivity",
    label: "Noise Sensitivity (Hyperacusis)",
    dimensions: {
      severity: ["mildly annoying", "painful to normal sounds"],
      associated: ["tinnitus", "headache", "facial nerve weakness"]
    }
  },
  {
    id: "ear_bleeding",
    label: "Ear Bleeding (Otorrhagia)",
    dimensions: {
      onset: ["after trauma", "spontaneous", "after Q-tip usage"],
      character: ["frank red blood", "sanguinous discharge", "clots"],
      associated: ["hearing loss", "severe pain", "head injury"]
    },
    redFlags: [
      "Bleeding following head trauma (basilar skull fracture alert)",
      "Associated with acute loss of hearing or facial palsy"
    ]
  }
];

export const EYE_MODELS: SymptomModel[] = [
  {
    id: "eye_vision_loss",
    label: "Vision Loss",
    dimensions: {
      onset: ["sudden", "gradual"],
      location: ["one eye", "both eyes", "central", "peripheral"],
      character: ["complete loss", "partial loss", "curtain/shadow"]
    },
    redFlags: [
      "Sudden monocular or binocular vision loss",
      "Curtain coming down over vision",
      "Associated severe eye pain or neurological symptoms"
    ]
  },
  {
    id: "eye_blurred_vision",
    label: "Blurred Vision",
    dimensions: {
      onset: ["sudden", "gradual"],
      location: ["one eye", "both eyes"],
      character: ["all the time", "intermittent", "distance vision", "near vision"]
    },
    redFlags: [
      "Sudden onset blurring",
      "Associated with severe eye pain or nausea"
    ]
  },
  {
    id: "eye_double_vision",
    label: "Double Vision (Diplopia)",
    dimensions: {
      type: ["horizontal", "vertical", "diagonal"],
      condition: ["monocular (one eye open)", "binocular (both eyes open)"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Sudden onset binocular double vision",
      "Associated with focal neurological signs or ptosis"
    ]
  },
  {
    id: "eye_pain",
    label: "Eye Pain",
    dimensions: {
      location: ["surface", "deep ocular", "retrobulbar / behind eye"],
      character: ["sharp / stabbing", "aching / dull", "burning", "throbbing"],
      triggers: ["eye movement", "light", "blinking"]
    },
    redFlags: [
      "Severe deep eye pain with red eye and halo vision",
      "Pain with extraocular movement (optic neuritis alert)",
      "Pain after chemical injury or trauma"
    ]
  },
  {
    id: "eye_red_eye",
    label: "Red Eye",
    dimensions: {
      location: ["diffuse conjunctival", "ciliary flush / limbal", "localized spot"],
      associated: ["discharge", "itching", "tearing", "pain"]
    },
    redFlags: [
      "Ciliary flush / limbal injection",
      "Severe eye pain or photophobia",
      "Decreased visual acuity"
    ]
  },
  {
    id: "eye_swelling",
    label: "Eye Swelling",
    dimensions: {
      location: ["orbital", "periorbital", "proptosis / bulging eye"],
      onset: ["acute", "gradual"]
    },
    redFlags: [
      "Proptosis (bulging eye)",
      "Pain with eye movement and fever (orbital cellulitis alert)",
      "Limited extraocular eye movements"
    ]
  },
  {
    id: "eyelid_swelling",
    label: "Eyelid Swelling",
    dimensions: {
      location: ["upper lid", "lower lid", "bilateral lids"],
      character: ["painful / erythematous", "painless", "localized nodule (chalazion/stye)"]
    },
    redFlags: [
      "Spreading beyond lid margin into orbit",
      "Inability to open eye due to massive edema"
    ]
  },
  {
    id: "eye_discharge",
    label: "Eye Discharge",
    dimensions: {
      character: ["purulent / pus-like", "watery", "mucoid / stringy", "crusty in morning"],
      location: ["one eye", "both eyes"]
    },
    redFlags: [
      "Profuse hyperpurulent discharge (gonococcal alert)",
      "Associated vision loss or severe pain"
    ]
  },
  {
    id: "eye_excessive_tearing",
    label: "Excessive Tearing (Epiphora)",
    dimensions: {
      onset: ["acute", "chronic"],
      triggers: ["wind/cold air", "bright light", "spontaneous overflow"]
    },
    redFlags: [
      "Medial canthal redness and swelling (dacryocystitis)",
      "Associated corneal abrasion or foreign body"
    ]
  },
  {
    id: "eye_dry_eyes",
    label: "Dry Eyes",
    dimensions: {
      character: ["stinging", "burning", "gritty / sandy feeling"],
      triggers: ["prolonged screen time", "wind", "dry air"]
    },
    redFlags: [
      "Severe corneal epithelial defect",
      "Inability to close eyelids fully (lagophthalmos)"
    ]
  },
  {
    id: "eye_foreign_body_sensation",
    label: "Foreign Body Sensation",
    dimensions: {
      character: ["gritty", "feeling of object under lid"],
      associated: ["tearing", "pain on blinking", "photophobia"]
    },
    redFlags: [
      "High-speed metal or grinding history (intraocular FB risk)",
      "Corneal ulceration suspicion",
      "Irregular pupil shape"
    ]
  },
  {
    id: "eye_light_sensitivity",
    label: "Light Sensitivity (Photophobia)",
    dimensions: {
      severity: ["mild discomfort", "severe pain with normal room light"],
      associated: ["headache", "eye pain", "fever", "neck stiffness"]
    },
    redFlags: [
      "Consensual photophobia (pain in affected eye when light shone in other eye - anterior uveitis)",
      "Photophobia with neck stiffness and fever"
    ]
  },
  {
    id: "eye_flashes_of_light",
    label: "Flashes of Light (Photopsia)",
    dimensions: {
      location: ["temporal field", "peripheral", "central"],
      character: ["sparkling lights", "lightning streaks"],
      frequency: ["frequent new flashes", "occasional"]
    },
    redFlags: [
      "Sudden shower of flashes with new floaters (retinal tear alert)",
      "Dark curtain encroaching on vision"
    ]
  },
  {
    id: "eye_floaters",
    label: "Floaters",
    dimensions: {
      character: ["cobwebs", "dark specks", "ring / translucent spots"],
      onset: ["sudden increase", "longstanding stable"]
    },
    redFlags: [
      "Sudden onset of many new floaters ('pepper spots')",
      "Associated with photopsia or shadow in peripheral vision"
    ]
  },
  {
    id: "eye_strain",
    label: "Eye Strain",
    dimensions: {
      triggers: ["digital screen use", "reading in dim light", "uncorrected refractive error"],
      associated: ["brow ache", "mild headache"]
    }
  },
  {
    id: "eye_fatigue",
    label: "Eye Fatigue",
    dimensions: {
      character: ["heavy eyelids", "tired eye feeling"],
      timing: ["end of day", "after prolonged visual task"],
      relief: ["resting closed eyes", "sleep"]
    }
  },
  {
    id: "eye_visual_field_loss",
    label: "Visual Field Loss",
    dimensions: {
      pattern: ["hemianopia (half field)", "quadrantanopia", "scotoma / blind spot", "peripheral constriction"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Sudden visual field defect (stroke, optic neuritis, or retinal vascular occlusion alert)",
      "Bitemporal hemianopia (chiasmal lesion concern)"
    ]
  },
  {
    id: "eye_distorted_vision",
    label: "Distorted Vision (Metamorphopsia)",
    dimensions: {
      character: ["straight lines appear wavy", "objects appear smaller (micropsia) or larger (macropsia)"],
      location: ["central vision field"]
    },
    redFlags: [
      "Acute onset central line distortion (macular degeneration / macular hole alert)"
    ]
  },
  {
    id: "eye_color_vision_changes",
    label: "Color Vision Changes",
    dimensions: {
      character: ["faded colors", "loss of red saturation (red desaturation)", "altered color perception"],
      onset: ["sudden", "gradual"]
    },
    redFlags: [
      "Red desaturation in one eye (optic neuritis / optic neuropathy alert)"
    ]
  },
  {
    id: "eye_nyctalopia",
    label: "Difficulty Seeing at Night (Nyctalopia)",
    dimensions: {
      severity: ["mild night vision impairment", "unable to navigate dim light"],
      onset: ["progressive over years", "recent onset"]
    }
  },
  {
    id: "eye_dark_adaptation_difficulty",
    label: "Difficulty Adapting to Darkness",
    dimensions: {
      character: ["prolonged time to adjust when entering dark room from sunlight"],
      severity: ["mild delay", "marked delay"]
    }
  },
  {
    id: "eye_glare_sensitivity",
    label: "Glare Sensitivity",
    dimensions: {
      triggers: ["oncoming car headlights at night", "bright sunlight"],
      associated: ["starbursts", "decreased contrast sensitivity"]
    }
  },
  {
    id: "eye_halos_around_lights",
    label: "Halos Around Lights",
    dimensions: {
      character: ["rainbow-colored rings around streetlights/lamps"],
      associated: ["hazy vision", "eye pain", "headache", "nausea"]
    },
    redFlags: [
      "Halos + severe eye pain + cloudy cornea (Acute angle-closure glaucoma emergency)"
    ]
  },
  {
    id: "eye_transient_vision_loss",
    label: "Transient Vision Loss",
    dimensions: {
      duration: ["seconds to minutes", "Amaurosis fugax ('curtain coming down')", "post-exercise"],
      onset: ["sudden monocular blackouts"]
    },
    redFlags: [
      "Amaurosis fugax (carotid embolic / TIA emergency)",
      "Giant cell arteritis suspicion in older adults (>50 with jaw claudication/scalp tenderness)"
    ]
  },
  {
    id: "eye_difficulty_focusing",
    label: "Difficulty Focusing",
    dimensions: {
      type: ["near accommodation lag", "distance refocused lag", "fluctuating focus"],
      triggers: ["fatigue", "switching between near and far objects"]
    }
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
    id: "back_pain",
    label: "Back Pain",
    dimensions: {
      location: ["lower back (lumbar)", "upper back (thoracic)", "mid-back", "generalized"],
      onset: ["sudden", "gradual"],
      character: ["sharp", "dull ache", "burning", "radiating to legs"],
      triggers: ["lifting", "bending", "sitting", "standing", "movement"]
    },
    redFlags: [
      "Loss of bladder or bowel control (Cauda Equina Syndrome)",
      "Saddle anesthesia (numbness in groin/buttocks)",
      "Fever or unexplained weight loss with back pain",
      "Progressive motor weakness in legs",
      "Pain following significant trauma"
    ],
    requiredExams: [
      "Perform straight leg raise test",
      "Assess lower extremity strength, sensation, and reflexes",
      "Palpate spine for focal tenderness"
    ]
  },
  {
    id: "back_stiffness",
    label: "Back Stiffness",
    dimensions: {
      timing: ["morning stiffness", "after prolonged sitting", "end of day"],
      duration: ["< 30 minutes", "> 1 hour (inflammatory concern)"],
      relief: ["movement / exercise", "warmth", "rest"]
    },
    redFlags: [
      "Morning stiffness lasting > 1 hour in young patient (Ankylosing spondylitis risk)",
      "Associated joint swelling or eye inflammation"
    ]
  },
  {
    id: "back_muscle_spasm",
    label: "Back Muscle Spasm",
    dimensions: {
      onset: ["sudden acute spasm", "recurrent cramping"],
      character: ["intense contraction", "painful locking / guarding"],
      triggers: ["sudden movement", "heavy lifting", "poor posture"]
    },
    redFlags: [
      "Inability to move or stand due to severe muscle guarding",
      "Spasm accompanied by severe neurological deficits"
    ]
  },
  {
    id: "tailbone_pain",
    label: "Tailbone Pain (Coccydynia)",
    dimensions: {
      onset: ["after direct fall/trauma", "spontaneous", "post-childbirth"],
      triggers: ["sitting on hard surfaces", "leaning back while sitting", "rising from seated position"],
      character: ["sharp aching", "localized tenderness at coccyx"]
    },
    redFlags: [
      "Pilonidal cyst / sinus drainage or abscess",
      "Progressive mass or severe localized swelling"
    ]
  },
  {
    id: "spinal_deformity",
    label: "Spinal Deformity",
    dimensions: {
      type: ["scoliosis (lateral curvature)", "kyphosis (humpback)", "lordosis (swayback)", "loss of normal curvature"],
      onset: ["congenital / childhood", "adolescent", "progressive in adulthood"]
    },
    redFlags: [
      "Rapidly progressing curve with pain",
      "Neurological impairment or shortness of breath due to thoracic deformity"
    ]
  },
  {
    id: "difficulty_standing_upright",
    label: "Difficulty Standing Upright",
    dimensions: {
      sensation: ["forced stooped posture (camptocormia)", "severe pain when extending spine", "feeling pulled forward"],
      relief: ["sitting", "leaning forward on shopping cart"]
    },
    redFlags: [
      "Sudden inability to bear weight",
      "Acute spinal cord or nerve root compression"
    ]
  }
];

export const LUNGS_MODELS: SymptomModel[] = [
  {
    id: "lungs_dyspnea",
    label: "Shortness of Breath (Dyspnea)",
    dimensions: {
      onset: ["sudden (Acute)", "gradual over days", "chronic/progressive"],
      triggers: ["at rest", "light activity", "heavy exertion (DOE)", "no clear trigger", "exposure to allergens/cold"],
      severity: ["cannot speak in full sentences", "affects normal conversation", "only with exercise"]
    },
    redFlags: [
      "Sudden severe dyspnea (Pulmonary Embolism / Pneumothorax alert)",
      "Inability to speak in full sentences",
      "Bluish tint to lips/fingernails (Cyanosis)",
      "Silent chest (no air movement heard - Asthma emergency)",
      "Use of accessory muscles (neck/rib retractions)"
    ],
    requiredExams: [
      "Vital signs including pulse oximetry",
      "Auscultation for wheezing, crackles, or absent breath sounds",
      "Assess for use of accessory muscles and work of breathing"
    ]
  },
  {
    id: "lungs_tachypnea",
    label: "Rapid Breathing (Tachypnea)",
    dimensions: {
      rate: ["respiratory rate 20-24/min", "respiratory rate > 25/min", "respiratory rate > 30/min"],
      onset: ["sudden", "gradual"],
      associated: ["fever", "chest pain", "anxiety", "lightheadedness"]
    },
    redFlags: [
      "Breathing rate > 30 breaths per minute",
      "Central cyanosis or altered mental status",
      "Kussmaul breathing (deep, rapid breathing in DKA)"
    ],
    requiredExams: [
      "Count respiratory rate over full 60 seconds",
      "Arterial blood gas (ABG) if severe"
    ]
  },
  {
    id: "lungs_air_hunger",
    label: "Air Hunger",
    dimensions: {
      sensation: ["feeling of unsatisfied breathing", "gasping for air", "inability to take a deep breath"],
      triggers: ["exertion", "lying flat", "panic / anxiety", "spontaneous"]
    },
    redFlags: [
      "Air hunger with acute chest pressure or diaphoresis",
      "Associated with stridor or upper airway obstruction"
    ]
  },
  {
    id: "lungs_cough",
    label: "Cough",
    dimensions: {
      character: ["dry/hacking", "productive (wet/sputum)", "whooping/paroxysmal", "barking (croupy)"],
      duration: ["acute (< 3 weeks)", "subacute (3-8 weeks)", "chronic (> 8 weeks)"],
      timing: ["nocturnal (at night)", "morning only", "constant", "with eating/drinking (aspiration)"]
    },
    redFlags: [
      "High fever and chills (Pneumonia)",
      "Unexplained weight loss or night sweats (TB/Malignancy)",
      "New or changing cough in long-term smoker",
      "Cough accompanied by syncope"
    ],
    requiredExams: [
      "Chest X-ray if chronic, atypical, or accompanied by red flags",
      "Spirometry if asthma or COPD suspected"
    ]
  },
  {
    id: "lungs_sputum_production",
    label: "Sputum Production",
    dimensions: {
      character: ["clear/white (mucoid)", "yellow/green (purulent)", "thick/tenacious", "foul-smelling", "pink/frothy", "rust-colored"],
      amount: ["small/streaks", "moderate (teaspoons)", "copious (cups per day)"]
    },
    redFlags: [
      "Pink, frothy sputum (Acute Pulmonary Edema alert)",
      "Foul-smelling sputum (Lung abscess / anaerobic infection)",
      "Blood-streaked or frank hemoptysis"
    ],
    requiredExams: [
      "Sputum culture and sensitivity",
      "Sputum for Acid Fast Bacilli (AFB) if TB suspected"
    ]
  },
  {
    id: "lungs_wheezing",
    label: "Wheezing",
    dimensions: {
      phase: ["expiratory wheezing", "inspiratory wheezing", "biphasic"],
      triggers: ["cold air", "exercise", "allergens", "viral infection"],
      response: ["relieved by bronchodilator", "unresponsive to inhaler"]
    },
    redFlags: [
      "Silent chest (diminished breath sounds with severe air flow obstruction)",
      "Severe respiratory distress or cyanosis"
    ]
  },
  {
    id: "lungs_stridor",
    label: "Stridor",
    dimensions: {
      timing: ["high-pitched inspiratory", "expiratory", "biphasic"],
      onset: ["sudden acute", "gradual"],
      associated: ["barking cough", "drooling", "hoarseness", "fever"]
    },
    redFlags: [
      "Stridor at rest (Upper airway emergency - Foreign body, Epiglottitis, Anaphylaxis, Croup)",
      "Inability to swallow or drooling",
      "Sternal retractions"
    ],
    requiredExams: [
      "Immediate airway assessment",
      "Do NOT agitate child or perform oral exam if epiglottitis suspected"
    ]
  },
  {
    id: "lungs_orthopnea",
    label: "Orthopnea",
    dimensions: {
      severity: ["needs 1 pillow", "needs 2-3 pillows", "must sleep upright in chair"],
      onset: ["acute worsening", "chronic gradual"]
    },
    redFlags: [
      "Orthopnea with leg swelling and JVD (Heart Failure)",
      "Acute pulmonary edema"
    ]
  },
  {
    id: "lungs_pnd",
    label: "Paroxysmal Nocturnal Dyspnea (PND)",
    dimensions: {
      timing: ["waking 1-3 hours after falling asleep"],
      sensation: ["sudden severe air hunger", "must sit at edge of bed or open window"],
      relief: ["improves after 20-30 minutes upright"]
    },
    redFlags: [
      "Associated with pink frothy sputum or chest pain",
      "Acute congestive heart failure decompensation"
    ]
  },
  {
    id: "lungs_chest_tightness",
    label: "Chest Tightness",
    dimensions: {
      character: ["band-like constriction", "heavy pressure", "inability to expand chest"],
      triggers: ["allergens", "cold air", "exertion", "stress"]
    },
    redFlags: [
      "Chest tightness radiating to arm or jaw (Cardiac ischemia)",
      "Associated with diaphoresis or dizziness"
    ]
  },
  {
    id: "lungs_chest_congestion",
    label: "Chest Congestion",
    dimensions: {
      sensation: ["rattling in chest", "fullness", "heavy secretions"],
      associated: ["cough", "fever", "nasal congestion"]
    }
  },
  {
    id: "lungs_pleuritic_chest_pain",
    label: "Pain on Breathing (Pleuritic Chest Pain)",
    dimensions: {
      character: ["sharp / stabbing", "catches on deep inspiration", "localized"],
      triggers: ["deep breath", "coughing", "sneezing", "twisting"]
    },
    redFlags: [
      "Pleuritic pain + sudden dyspnea + tachycardia (Pulmonary Embolism alert)",
      "Pleuritic pain + high fever + purulent sputum (Pneumonia)",
      "Decreased breath sounds on affected side (Pneumothorax)"
    ]
  },
  {
    id: "lungs_hemoptysis",
    label: "Hemoptysis (Coughing Up Blood)",
    dimensions: {
      character: ["blood-streaked sputum", "frank red blood", "dark blood clots"],
      amount: ["scant (< 20 mL)", "massive (> 100-600 mL/24 hr)"]
    },
    redFlags: [
      "Massive hemoptysis (Airway threat - immediate emergency)",
      "Associated with sudden dyspnea and leg swelling (PE)",
      "Unintentional weight loss and night sweats (TB / Malignancy)"
    ]
  },
  {
    id: "lungs_apnea",
    label: "Apnea (episodes of stopped breathing)",
    dimensions: {
      setting: ["during sleep (witnessed apnea)", "awake pauses", "infant breathing pauses"],
      duration: ["< 10 seconds", "10-20 seconds", "> 20 seconds"],
      associated: ["gasping/snorting", "daytime sleepiness", "cyanosis"]
    },
    redFlags: [
      "Apnea with cyanosis or bradycardia",
      "Apparent Life-Threatening Event (ALTE / BRUE) in infant"
    ]
  },
  {
    id: "lungs_breath_holding",
    label: "Breath-Holding Episodes",
    dimensions: {
      triggers: ["frustration / anger / crying", "pain / fright"],
      type: ["cyanotic (blue)", "pallid (pale)"],
      duration: ["< 1 minute", "loss of consciousness / brief twitching"]
    },
    redFlags: [
      "Prolonged loss of consciousness or true seizure activity",
      "Onset in infants < 6 months or children > 6 years"
    ]
  },
  {
    id: "lungs_difficulty_deep_breath",
    label: "Difficulty Taking a Deep Breath",
    dimensions: {
      sensation: ["cannot get air all the way down", "restriction / chest wall pain", "incomplete breath"],
      triggers: ["anxiety", "pleuritic pain", "posture"]
    }
  },
  {
    id: "lungs_hoarseness",
    label: "Hoarseness",
    dimensions: {
      character: ["raspy voice", "harsh / strained voice", "complete loss of voice (aphonia)"],
      duration: ["acute (< 2 weeks)", "persistent (> 2-3 weeks)"],
      triggers: ["voice overuse", "URI", "smoking", "GERD"]
    },
    redFlags: [
      "Persistent hoarseness > 3 weeks (Laryngeal cancer / vocal cord palsy risk)",
      "Associated with difficulty swallowing or neck mass"
    ]
  }
];

export const HEART_MODELS: SymptomModel[] = [
  {
    id: "heart_chest_pain",
    label: "Chest Pain",
    dimensions: {
      location: ["substernal / central", "left-sided", "radiating to left arm", "radiating to jaw/neck", "radiating to back"],
      character: ["sharp", "dull ache", "stabbing", "burning"],
      onset: ["sudden acute", "gradual", "with exertion", "at rest"],
      duration: ["seconds", "minutes", "hours"]
    },
    redFlags: [
      "Acute severe chest pain radiating to left arm or jaw (MI alert)",
      "Chest pain accompanied by profuse cold sweats (diaphoresis) or syncope",
      "Pain not relieved by rest or nitroglycerin",
      "Sudden tearing pain radiating to back (Aortic dissection alert)"
    ],
    requiredExams: [
      "Obtain 12-lead ECG immediately",
      "Check vital signs (BP both arms, HR, SpO2)",
      "Auscultate heart sounds (murmurs, gallops, friction rub)"
    ]
  },
  {
    id: "heart_chest_pressure",
    label: "Chest Pressure",
    dimensions: {
      character: ["crushing weight", "heavy squeezing", "tight fullness"],
      triggers: ["physical exertion", "emotional stress", "cold exposure", "at rest"],
      relief: ["rest", "nitroglycerin", "none"]
    },
    redFlags: [
      "Crushing pressure with diaphoresis, nausea, or shortness of breath",
      "New onset angina or unstable progression"
    ]
  },
  {
    id: "heart_palpitations",
    label: "Palpitations",
    dimensions: {
      character: ["racing heart (tachycardia)", "skipped / irregular beats", "fluttering in chest", "pounding sensation"],
      onset: ["sudden onset/offset", "gradual"],
      triggers: ["exertion", "stress", "caffeine", "alcohol", "at rest"]
    },
    redFlags: [
      "Palpitations with syncope or presyncope",
      "Palpitations associated with chest pain or severe dyspnea",
      "Family history of sudden cardiac death"
    ]
  },
  {
    id: "heart_syncope",
    label: "Syncope (Fainting)",
    dimensions: {
      onset: ["sudden without warning (cardiac)", "with lightheaded/tunnel vision prodrome (vasovagal)"],
      triggers: ["during physical exertion", "upon standing", "emotional distress", "prolonged standing"],
      duration: ["seconds", "< 1-2 minutes"]
    },
    redFlags: [
      "Syncope during physical exertion or while supine",
      "Sudden syncope without warning prodrome",
      "Associated with chest pain or palpitations",
      "Known structural heart disease or abnormal ECG"
    ]
  },
  {
    id: "heart_presyncope",
    label: "Presyncope (Near Fainting)",
    dimensions: {
      sensation: ["feeling about to pass out", "tunnel vision / dimming sight", "lightheadedness", "diaphoresis / warmth"],
      triggers: ["standing up quickly (orthostatic)", "prolonged standing", "dehydration", "exertion"]
    },
    redFlags: [
      "Presyncope occurring during exertion or supine",
      "Associated with chest discomfort or irregular pulse"
    ]
  },
  {
    id: "heart_lower_limb_swelling",
    label: "Lower Limb Swelling",
    dimensions: {
      location: ["both legs (bilateral)", "one leg (unilateral)", "feet and ankles", "up to knees/thighs"],
      character: ["pitting edema", "non-pitting edema"],
      onset: ["sudden acute (< 24-48 hrs)", "gradual / chronic"]
    },
    redFlags: [
      "Sudden unilateral painful leg swelling (Deep Vein Thrombosis alert)",
      "Bilateral leg swelling with acute shortness of breath (Heart Failure decompensation)",
      "Rapidly spreading erythema or severe tenderness"
    ]
  },
  {
    id: "heart_upper_limb_swelling",
    label: "Upper Limb Swelling",
    dimensions: {
      location: ["unilateral arm", "bilateral arms", "hand / fingers"],
      onset: ["acute", "gradual"],
      associated: ["pain / heaviness", "venous prominence", "after catheter / PICC line"]
    },
    redFlags: [
      "Acute unilateral arm swelling with vascular access history (Upper extremity DVT)",
      "Associated facial or neck swelling (Superior Vena Cava Syndrome)"
    ]
  },
  {
    id: "heart_intermittent_claudication",
    label: "Intermittent Claudication",
    dimensions: {
      character: ["cramping pain in calf/thigh/buttock", "aching tightness"],
      triggers: ["reproducible walking distance"],
      relief: ["prompt relief within 2-5 minutes of rest"]
    },
    redFlags: [
      "Ischemic rest pain (pain in foot/toes when lying flat)",
      "Non-healing arterial ulcerations or gangrene (Critical Limb Ischemia)"
    ]
  },
  {
    id: "heart_cold_extremities",
    label: "Cold Extremities",
    dimensions: {
      location: ["hands and feet", "single cold foot/leg", "single cold hand"],
      onset: ["acute sudden onset", "chronic / cold sensitivity"],
      associated: ["numbness", "pain", "paleness"]
    },
    redFlags: [
      "Sudden onset of cold, pale, painful, pulseless limb (Acute Limb Ischemia 6 Ps)",
      "Asymmetric temperature change between extremities"
    ]
  },
  {
    id: "heart_cyanotic_extremities",
    label: "Cyanotic Extremities",
    dimensions: {
      location: ["peripheral (fingers, toes)", "central (lips, tongue, trunk)"],
      triggers: ["cold exposure", "at rest / room temperature"],
      associated: ["numbness", "tingling", "shortness of breath"]
    },
    redFlags: [
      "Central cyanosis (hypoxemia threat)",
      "Acute persistent cyanosis of single limb with pain"
    ]
  },
  {
    id: "heart_chest_tightness",
    label: "Chest Tightness",
    dimensions: {
      sensation: ["band-like constriction", "inability to expand chest fully"],
      triggers: ["exertion", "stress", "cold air", "allergens"]
    },
    redFlags: [
      "Chest tightness radiating to arm, neck, or jaw",
      "Associated with cold sweating or lightheadedness"
    ]
  },
  {
    id: "heart_cold_sweats",
    label: "Cold Sweats (Diaphoresis)",
    dimensions: {
      character: ["profuse cold sweating", "clammy skin"],
      setting: ["with chest discomfort", "with severe pain", "with lightheadedness"],
      onset: ["sudden acute"]
    },
    redFlags: [
      "Sudden cold sweats accompanied by chest pressure or pain (Acute Coronary Syndrome sign)",
      "Diaphoresis with severe hypotension or shock state"
    ]
  },
  {
    id: "heart_leg_heaviness",
    label: "Leg Heaviness",
    dimensions: {
      character: ["feeling of heavy or tired legs", "worsening towards end of day"],
      relief: ["elevation of legs", "compression stockings"],
      associated: ["visible varicose veins", "mild ankle swelling"]
    }
  },
  {
    id: "heart_limb_color_change",
    label: "Limb Color Change",
    dimensions: {
      character: ["pallor (pale)", "rubor (dark red when dependent)", "cyanosis (blue)", "mottled / livedo reticularis"],
      triggers: ["cold exposure (Raynaud's phenomenon)", "positional (elevation vs dependency)", "constant"]
    },
    redFlags: [
      "Triphasic color change with severe pain (white -> blue -> red)",
      "Persistent pale or mottled cold extremity with loss of pulse"
    ]
  }
];

export const DIGESTIVE_MODELS: SymptomModel[] = [
  {
    id: "gi_abdominal_pain",
    label: "Abdominal Pain",
    dimensions: {
      location: ["epigastric (upper center)", "right upper quadrant (RUQ)", "left upper quadrant (LUQ)", "right lower quadrant (RLQ)", "left lower quadrant (LLQ)", "periumbilical", "generalized / diffuse"],
      character: ["crampy (colicky)", "sharp / stabbing", "burning / gnawing", "dull ache", "constant"],
      relation_to_food: ["worse after eating", "relieved by eating", "worse when hungry", "unrelated"],
      triggers: ["fatty meals", "movement", "palpation", "spontaneous"]
    },
    redFlags: [
      "Severe acute onset with peritoneal signs (rigidity, rebound tenderness)",
      "Pain radiating to back or right shoulder",
      "Associated fever, persistent vomiting, or GI bleeding",
      "Pain with hemodynamic instability or syncope"
    ],
    requiredExams: [
      "Auscultate bowel sounds in all 4 quadrants",
      "Palpate for focal tenderness, guarding, and rebound",
      "Check Murphy's sign and McBurney's point tenderness if indicated"
    ]
  },
  {
    id: "gi_heartburn",
    label: "Heartburn",
    dimensions: {
      location: ["retrosternal (behind breastbone)", "radiating to neck"],
      triggers: ["lying flat", "bending over", "spicy / fatty foods", "large meals"],
      relief: ["antacids", "sitting upright", "water"]
    }
  },
  {
    id: "gi_acid_regurgitation",
    label: "Acid Regurgitation (Acid Reflux)",
    dimensions: {
      character: ["effortless return of sour/bitter fluid into throat or mouth", "wet burp"],
      timing: ["nocturnal / while lying down", "postprandial (after eating)"]
    },
    redFlags: [
      "Associated dysphagia or odynophagia",
      "Unexplained weight loss"
    ]
  },
  {
    id: "gi_nausea",
    label: "Nausea",
    dimensions: {
      timing: ["morning nausea", "postprandial", "constant", "intermittent"],
      triggers: ["food odors", "motion", "medications", "early pregnancy"],
      associated: ["diaphoresis", "salivation", "dizziness"]
    }
  },
  {
    id: "gi_vomiting",
    label: "Vomiting",
    dimensions: {
      content: ["undigested food", "bile (yellow/green)", "blood (hematemesis)", "coffee-ground material"],
      character: ["projectile", "retching / dry heaves", "intermittent"],
      frequency: ["1-2 episodes", "frequent / persistent (> 5 times/day)"]
    },
    redFlags: [
      "Vomiting frank blood or coffee-ground material (Upper GI bleed alert)",
      "Inability to keep liquids down for > 24 hours (Severe dehydration risk)",
      "Feculent vomitus (Bowel obstruction alert)",
      "Vomiting accompanied by severe headache or stiff neck"
    ]
  },
  {
    id: "gi_difficulty_swallowing",
    label: "Difficulty Swallowing (Dysphagia)",
    dimensions: {
      type: ["solids only", "liquids only", "both solids and liquids"],
      location: ["throat / high (oropharyngeal)", "chest / low (esophageal)"],
      progression: ["sudden onset", "gradual progressive (solids then liquids)"]
    },
    redFlags: [
      "Progressive dysphagia (Malignancy threat)",
      "Associated significant unintentional weight loss",
      "Frequent coughing / choking on food or liquids (Aspiration risk)"
    ],
    requiredExams: [
      "Barium swallow or upper endoscopy (EGD) evaluation",
      "Assess cranial nerves IX, X, XII for swallow function"
    ]
  },
  {
    id: "gi_painful_swallowing",
    label: "Painful Swallowing (Odynophagia)",
    dimensions: {
      character: ["sharp pain", "burning sensation with swallow"],
      location: ["retrosternal", "throat"]
    },
    redFlags: [
      "Severe pain preventing oral hydration",
      "Odynophagia in immunocompromised patient (Infectious esophagitis alert)"
    ]
  },
  {
    id: "gi_diarrhea",
    label: "Diarrhea",
    dimensions: {
      character: ["watery", "loose / mushy", "mucous", "oily / greasy (steatorrhea)"],
      frequency: ["3-5 times/day", "> 5 times/day"],
      duration: ["acute (< 2 weeks)", "subacute (2-4 weeks)", "chronic (> 4 weeks)"]
    },
    redFlags: [
      "Nocturnal diarrhea (wakes patient from sleep - organic disease sign)",
      "Bloody diarrhea with high fever (Invasive infection / IBD alert)",
      "Signs of severe dehydration or electrolyte collapse"
    ]
  },
  {
    id: "gi_constipation",
    label: "Constipation",
    dimensions: {
      character: ["hard / lumpy stools (Bristol type 1-2)", "severe straining", "feeling of incomplete evacuation"],
      frequency: ["< 3 bowel movements per week", "recent change from baseline"]
    },
    redFlags: [
      "New onset constipation in patient > 50 years old",
      "Thin / pencil-caliber stools",
      "Associated severe abdominal pain, distension, or vomiting"
    ]
  },
  {
    id: "gi_abdominal_bloating",
    label: "Abdominal Bloating",
    dimensions: {
      sensation: ["uncomfortable fullness", "tightness in upper or lower abdomen"],
      timing: ["worse at end of day", "worse after eating"],
      relief: ["passing gas or stool"]
    }
  },
  {
    id: "gi_excessive_gas",
    label: "Excessive Gas (Flatulence)",
    dimensions: {
      character: ["frequent flatus", "excessive belching / burping"],
      triggers: ["dairy products", "high-fiber foods", "carbonated drinks", "artificial sweeteners"]
    }
  },
  {
    id: "gi_rectal_bleeding",
    label: "Rectal Bleeding",
    dimensions: {
      character: ["bright red blood on toilet paper", "blood dripping into toilet bowl", "blood coating surface of stool"],
      associated: ["pain with defecation (fissure/hemorrhoid)", "painless"]
    },
    redFlags: [
      "Large volume rectal bleeding",
      "Bleeding associated with dizziness, syncope, or orthostasis"
    ]
  },
  {
    id: "gi_blood_in_stool",
    label: "Blood in Stool (Hematochezia)",
    dimensions: {
      character: ["maroon-colored stool", "bright red blood mixed throughout stool"],
      frequency: ["intermittent", "persistent with every bowel movement"]
    },
    redFlags: [
      "Maroon or dark red blood mixed in stool (Lower/Mid GI bleeding alert)",
      "Associated weakness, fatigue, or drop in hemoglobin"
    ]
  },
  {
    id: "gi_black_tarry_stool",
    label: "Black Tarry Stool (Melena)",
    dimensions: {
      character: ["sticky black tar-like stool", "foul metallic odor"],
      frequency: ["single episode", "multiple bowel movements"]
    },
    redFlags: [
      "Melena is a medical emergency (Upper GI bleeding alert - Ulcer / Varices)",
      "Associated hemodynamic instability or lightheadedness"
    ],
    requiredExams: [
      "Urgent digital rectal exam (DRE) to confirm melena",
      "Stat CBC, BUN/Creatinine ratio (elevated BUN/Cr > 30 suggests upper GI bleed)",
      "Urgent gastroenterology consult for upper endoscopy (EGD)"
    ]
  },
  {
    id: "gi_early_satiety",
    label: "Early Satiety",
    dimensions: {
      severity: ["feeling full after a few bites", "unable to finish normal portions"],
      associated: ["postprandial fullness", "nausea", "weight loss"]
    },
    redFlags: [
      "Early satiety with rapid unexplained weight loss",
      "Palpable epigastric or abdominal mass"
    ]
  },
  {
    id: "gi_tenesmus",
    label: "Tenesmus",
    dimensions: {
      character: ["painful, urgent sensation of needing to pass stool when bowels are empty"],
      associated: ["rectal pain", "mucous discharge", "frequent small-volume stools"]
    },
    redFlags: [
      "Tenesmus with rectal bleeding or pus (Proctitis / IBD / Rectal tumor)"
    ]
  },
  {
    id: "gi_abdominal_distension",
    label: "Abdominal Distension",
    dimensions: {
      character: ["visible abdominal swelling", "increased belt / waist size"],
      onset: ["acute over hours/days", "progressive over weeks/months"]
    },
    redFlags: [
      "Distension with fluid wave or shifting dullness (Ascites alert)",
      "Distension with severe pain, vomiting, and obstipation (Bowel obstruction / Ileus)"
    ]
  },
  {
    id: "gi_food_intolerance",
    label: "Food Intolerance",
    dimensions: {
      triggers: ["lactose / dairy", "gluten", "fatty foods", "high FODMAP foods", "spicy foods"],
      sensation: ["cramping", "bloating", "diarrhea within hours of ingestion"]
    }
  },
  {
    id: "gi_fecal_incontinence",
    label: "Fecal Incontinence (Loss of Bowel Control)",
    dimensions: {
      type: ["urge incontinence (cannot reach toilet in time)", "passive leakage (unaware)", "gas incontinence"],
      frequency: ["occasional accidents", "daily / frequent"]
    },
    redFlags: [
      "Sudden onset fecal incontinence with back pain or saddle anesthesia (Cauda Equina Syndrome emergency)",
      "Associated with acute progressive neurological weakness"
    ]
  },
  {
    id: "gi_change_in_bowel_habits",
    label: "Change in Bowel Habits",
    dimensions: {
      pattern: ["alternating diarrhea and constipation", "persistent shift to looser stools", "persistent shift to harder stools"],
      duration: ["several weeks", "months"]
    },
    redFlags: [
      "New, persistent change in bowel habits in patient > 45-50 years old (Colorectal cancer screening alert)",
      "Associated anemia, blood in stool, or weight loss"
    ]
  }
];

export const KIDNEY_MODELS: SymptomModel[] = [
  {
    id: "renal_painful_urination",
    label: "Painful Urination (Dysuria)",
    dimensions: {
      character: ["burning sensation", "stinging", "sharp pain"],
      timing: ["at start of voiding", "throughout voiding", "at end of voiding (terminal dysuria)"],
      associated: ["urinary urgency", "frequency", "foul odor"]
    },
    redFlags: [
      "Fever, chills, and rigors (Pyelonephritis alert)",
      "Severe flank pain",
      "Gross hematuria"
    ],
    requiredExams: [
      "Urinalysis with dipstick and microscopy",
      "Urine culture and sensitivity"
    ]
  },
  {
    id: "renal_urinary_frequency",
    label: "Urinary Frequency",
    dimensions: {
      frequency: ["voiding > 8 times during day", "voiding every 1-2 hours"],
      onset: ["acute onset", "chronic / gradual"]
    },
    redFlags: [
      "Frequency with polydipsia and weight loss (Diabetes Mellitus screening)",
      "Associated high fever"
    ]
  },
  {
    id: "renal_urinary_urgency",
    label: "Urinary Urgency",
    dimensions: {
      character: ["sudden, compelling, uncontrollable urge to urinate"],
      sensation: ["fear of leakage / urge incontinence"]
    }
  },
  {
    id: "renal_nocturia",
    label: "Nocturia",
    dimensions: {
      frequency: ["waking 1 time per night", "waking 2-3 times per night", "waking >= 4 times per night"],
      impact: ["disrupted sleep", "daytime fatigue"]
    }
  },
  {
    id: "renal_hesitancy",
    label: "Hesitancy",
    dimensions: {
      character: ["delay in initiating urinary stream", "straining to begin voiding"]
    }
  },
  {
    id: "renal_weak_stream",
    label: "Weak Urinary Stream",
    dimensions: {
      character: ["decreased force of stream", "narrow / fine stream"]
    }
  },
  {
    id: "renal_intermittent_stream",
    label: "Intermittent Urinary Stream",
    dimensions: {
      character: ["stop-and-start stream during single voiding episode"]
    }
  },
  {
    id: "renal_urinary_retention",
    label: "Urinary Retention",
    dimensions: {
      type: ["acute complete inability to void", "chronic partial retention"],
      associated: ["suprapubic fullness / severe pain", "overflow dribbling"]
    },
    redFlags: [
      "Acute complete urinary retention (Medical emergency - urgent decompression required)",
      "Retention with lower extremity weakness or saddle numbness (Cauda Equina Syndrome)"
    ],
    requiredExams: [
      "Bladder ultrasound / Post-Void Residual (PVR) measurement",
      "Urgent urethral catheterization if acute"
    ]
  },
  {
    id: "renal_urinary_incontinence",
    label: "Urinary Incontinence",
    dimensions: {
      type: ["stress incontinence (coughing/sneezing/exertion)", "urge incontinence (overactive bladder)", "overflow incontinence", "functional incontinence"],
      frequency: ["occasional leaks", "daily requiring protective pads"]
    }
  },
  {
    id: "renal_hematuria",
    label: "Blood in Urine (Hematuria)",
    dimensions: {
      color: ["bright red / pink", "cola / tea-colored (old blood)", "blood clots present"],
      timing: ["painless gross hematuria", "painful hematuria"],
      character: ["microscopic (dipstick)", "macroscopic / visible"]
    },
    redFlags: [
      "Painless gross hematuria in patient > 40-50 years (Urothelial malignancy until proven otherwise)",
      "Large blood clots causing urinary retention / obstruction",
      "Associated rapid loss of renal function"
    ],
    requiredExams: [
      "Urinalysis and urine cytology",
      "Renal ultrasound or CT Urogram",
      "Cystoscopy evaluation"
    ]
  },
  {
    id: "renal_cloudy_urine",
    label: "Cloudy Urine",
    dimensions: {
      character: ["turbid / cloudy", "milky appearance", "visible sediment / flakes"],
      associated: ["foul smell", "dysuria", "fever"]
    }
  },
  {
    id: "renal_dark_urine",
    label: "Dark Urine",
    dimensions: {
      character: ["amber / dark tea-colored", "cola / brown-colored", "orange-tinged"],
      triggers: ["dehydration", "intense exercise (rhabdomyolysis)", "jaundice / bilirubinuria"]
    }
  },
  {
    id: "renal_foul_smelling_urine",
    label: "Foul-Smelling Urine",
    dimensions: {
      character: ["pungent / ammonia-like", "foul / offensive odor", "fishy smell"]
    }
  },
  {
    id: "renal_flank_pain",
    label: "Flank Pain",
    dimensions: {
      character: ["sharp colicky pain in waves (renal colic)", "constant dull ache"],
      location: ["left flank", "right flank", "radiating to groin / testicle / labia"],
      relief: ["writhing / inability to find comfortable position"]
    },
    redFlags: [
      "Severe unremitting flank pain with fever and rigors (Obstructed infected kidney emergency)",
      "Flank pain with hemodynamic instability (Ruptured AAA or renal hematoma)"
    ],
    requiredExams: [
      "Non-contrast CT scan of abdomen and pelvis (Stone protocol)",
      "Renal and bladder ultrasound"
    ]
  },
  {
    id: "renal_suprapubic_pain",
    label: "Suprapubic Pain",
    dimensions: {
      character: ["pressure / ache above pubic bone", "sharp bladder spasm"],
      relation_to_voiding: ["worse with bladder filling", "relieved after voiding"]
    }
  },
  {
    id: "renal_incomplete_emptying",
    label: "Incomplete Bladder Emptying",
    dimensions: {
      sensation: ["feeling of urine remaining in bladder after voiding", "need to void again immediately"]
    }
  },
  {
    id: "renal_post_void_dribbling",
    label: "Dribbling After Urination",
    dimensions: {
      character: ["involuntary drops leaking immediately after completing voiding"]
    }
  },
  {
    id: "renal_reduced_urine_output",
    label: "Reduced Urine Output",
    dimensions: {
      volume: ["oliguria (< 400 mL/24 hr)", "anuria (< 100 mL/24 hr)", "drop in volume"],
      onset: ["acute onset over hours/days", "gradual decrease"]
    },
    redFlags: [
      "Anuria / acute oliguria (Acute Kidney Injury / Acute urinary obstruction alert)",
      "Associated with fluid overload or confusion"
    ]
  },
  {
    id: "renal_excessive_urine_output",
    label: "Excessive Urine Output",
    dimensions: {
      volume: ["large volume voiding (> 3 L/24 hr)"],
      associated: ["excessive thirst (polydipsia)", "nocturia"]
    },
    redFlags: [
      "Polyuria + polydipsia + weight loss (Diabetes Mellitus or DI alert)"
    ]
  },
  {
    id: "renal_pneumaturia",
    label: "Pneumaturia (Air in Urine)",
    dimensions: {
      sensation: ["bubbles or gas passing during urination", "splattering urinary stream"]
    },
    redFlags: [
      "Pneumaturia indicates colovesical or enterovesical fistula (Diverticulitis, Crohn's, or Malignancy)"
    ]
  },
  {
    id: "renal_urinary_leakage",
    label: "Urinary Leakage",
    dimensions: {
      character: ["involuntary minor leaks", "post-micturition dribble", "continuous small leaks"]
    }
  }
];

export const SKIN_MODELS: SymptomModel[] = [
  {
    id: "skin_rash",
    label: "Skin Rash",
    dimensions: {
      location: ["generalized", "localized (face/trunk/limbs)", "flexural folds", "extensor surfaces"],
      appearance: ["macular (flat red)", "papular (raised bumps)", "maculopapular", "scaly / plaque"],
      character: ["itchy", "painful", "burning"]
    },
    redFlags: [
      "Rapidly spreading rash with fever (Sepsis / Meningococcemia alert)",
      "Rash with lip/tongue swelling or breathing difficulty (Anaphylaxis emergency)",
      "Non-blanching petechial or purpuric rash (Vasculitis / Severe thrombocytopenia)",
      "Widespread skin detachment or mucosal involvement (SJS / TEN emergency)"
    ],
    requiredExams: [
      "Dermatologic visual examination",
      "Skin biopsy if non-specific or atypical"
    ]
  },
  {
    id: "skin_pruritus",
    label: "Itching (Pruritus)",
    dimensions: {
      distribution: ["localized", "generalized without rash", "generalized with rash"],
      timing: ["worse at night (scabies suspicion)", "after warm bath/shower (polycythemia vera suspicion)", "constant"],
      severity: ["mild", "severe / disrupting sleep / excoriations present"]
    },
    redFlags: [
      "Generalized pruritus with jaundice and dark urine (Cholestatic liver disease alert)",
      "Generalized pruritus with unexplained weight loss, fever, or night sweats (Lymphoma / Hodgkin's alert)",
      "New severe pruritus following new medication start (Drug reaction)"
    ],
    requiredExams: [
      "Comprehensive Metabolic Panel (CMP) and Liver Function Tests (LFTs)",
      "Complete Blood Count (CBC) with differential"
    ]
  },
  {
    id: "skin_dry_skin",
    label: "Dry Skin",
    dimensions: {
      location: ["hands / forearms", "lower legs", "generalized"],
      character: ["rough / flaking", "scaling / cracking", "fissuring"],
      triggers: ["cold weather", "frequent handwashing", "harsh soaps"]
    }
  },
  {
    id: "skin_redness_erythema",
    label: "Skin Redness (Erythema)",
    dimensions: {
      distribution: ["localized area", "facial malar / butterfly distribution", "generalized erythrodermic"],
      temperature: ["warm / hot to touch", "normal temperature"],
      borders: ["well-demarcated", "diffuse / poorly defined", "expanding ring (target lesion)"]
    },
    redFlags: [
      "Rapidly expanding erythema with intense pain, fever, or crepitus (Necrotizing fasciitis / Cellulitis emergency)",
      "Expanding bull's-eye target lesion (Erythema migrans - Lyme disease)",
      "Erythroderma (> 90% body surface area red)"
    ]
  },
  {
    id: "skin_lesions",
    label: "Skin Lesions",
    dimensions: {
      type: ["macule", "papule", "nodule", "plaque", "cyst"],
      number: ["single lesion", "multiple localized", "widespread"],
      surface: ["smooth", "keratotic / rough", "ulcerated", "crusted"]
    },
    redFlags: [
      "Lesion with irregular borders, color variation, or rapid growth",
      "Non-healing lesion on sun-exposed skin"
    ]
  },
  {
    id: "skin_ulcers",
    label: "Skin Ulcers",
    dimensions: {
      location: ["lower extremity / malleolus", "pressure points / sacrum / heels", "toes / distal digits"],
      character: ["painful", "painless / neuropathic", "purulent discharge", "surrounding erythema"],
      underlying: ["venous insufficiency", "diabetic neuropathy", "arterial disease"]
    },
    redFlags: [
      "Rapidly spreading necrosis around ulcer base (Gangrene alert)",
      "Non-healing ulcer despite standard wound care (Marjolin ulcer / Malignancy alert)",
      "Ulcer with systemic signs of infection (fever, altered mental status)"
    ],
    requiredExams: [
      "Ankle-Brachial Index (ABI) assessment",
      "Wound culture and swab"
    ]
  },
  {
    id: "skin_tenderness",
    label: "Skin Tenderness",
    dimensions: {
      location: ["localized skin area", "along dermatome", "diffuse"],
      character: ["exquisite tenderness to light touch (allodynia)", "deep cutaneous pain"]
    },
    redFlags: [
      "Disproportionate cutaneous tenderness before visible rash along dermatome (Herpes Zoster prodrome)",
      "Severe skin pain out of proportion to exam findings (Necrotizing soft tissue infection alert)"
    ]
  },
  {
    id: "skin_easy_bruising",
    label: "Easy Bruising",
    dimensions: {
      location: ["extremities", "trunk", "spontaneous without known trauma"],
      character: ["ecchymoses (large bruises)", "petechiae (pinpoint purple dots)", "purpura"],
      history: ["family history of bleeding", "anticoagulant or antiplatelet use"]
    },
    redFlags: [
      "Spontaneous mucosal bleeding (epistaxis, gingival) with widespread petechiae (Severe thrombocytopenia / ITP)",
      "Easy bruising with recurrent infections and fatigue (Acute leukemia / Bone marrow failure alert)"
    ],
    requiredExams: [
      "Complete Blood Count (CBC) with platelet count",
      "Coagulation panel (PT/INR, PTT)"
    ]
  },
  {
    id: "skin_urticaria",
    label: "Hives (Urticaria)",
    dimensions: {
      character: ["transient itchy wheals / welts", "individual lesions resolve < 24 hrs"],
      duration: ["acute (< 6 weeks)", "chronic (>= 6 weeks)"],
      associated: ["lip / eyelid / throat swelling (Angioedema)"]
    },
    redFlags: [
      "Urticaria + voice hoarseness, stridor, or hypotension (Anaphylactic shock emergency)",
      "Urticarial lesions painful, burning, and lasting > 24 hours leaving hyperpigmentation (Urticarial vasculitis alert)"
    ]
  },
  {
    id: "skin_photosensitivity",
    label: "Photosensitivity",
    dimensions: {
      manifestation: ["exaggerated sunburn", "itchy rash on sun-exposed areas", "blistering after sun"],
      triggers: ["sunlight exposure", "medication use (doxycycline, thiazides, NSAIDs)"]
    },
    redFlags: [
      "Photosensitive malar rash + joint pain + fatigue (Systemic Lupus Erythematosus alert)"
    ]
  },

  // HAIR SYMPTOMS
  {
    id: "skin_hair_loss",
    label: "Hair Loss",
    dimensions: {
      pattern: ["patchy circular loss (Alopecia Areata)", "diffuse thinning (Telogen Effluvium)", "male/female pattern androgenetic", "scarring alopecia"],
      location: ["scalp", "eyebrows / eyelashes", "body hair"],
      onset: ["acute shedding", "gradual thinning over months/years"]
    },
    redFlags: [
      "Scarring alopecia with scalp redness, pustules, or permanent follicle destruction",
      "Hair loss accompanied by rapid weight changes, heat/cold intolerance, or severe fatigue (Thyroid disease)"
    ]
  },
  {
    id: "skin_hirsutism",
    label: "Excess Hair Growth (Hirsutism)",
    dimensions: {
      location: ["face (upper lip, chin)", "chest / abdomen", "back"],
      onset: ["gradual onset since adolescence (PCOS)", "rapid progression in adult female"],
      associated: ["acne", "menstrual irregularity", "deepening voice"]
    },
    redFlags: [
      "Rapidly progressive hirsutism with signs of virilization (Androgen-secreting adrenal or ovarian tumor alert)"
    ]
  },
  {
    id: "skin_brittle_hair",
    label: "Brittle Hair",
    dimensions: {
      character: ["fragile / easily breakage", "dry / dull texture", "split ends"],
      triggers: ["excessive chemical/heat styling", "nutritional deficiency", "hypothyroidism"]
    }
  },

  // NAIL SYMPTOMS
  {
    id: "skin_nail_discoloration",
    label: "Nail Discoloration",
    dimensions: {
      color: ["yellow / brown (Onychomycosis)", "white spots/bands (Leukonychia)", "greenish (Pseudomonas infection)", "black / dark longitudinal streak"],
      location: ["fingernails", "toenails", "single nail vs multiple"]
    },
    redFlags: [
      "New dark brown or black longitudinal band under a single nail extending into nail fold (Hutchinson's sign - Subungual melanoma alert)"
    ]
  },
  {
    id: "skin_brittle_nails",
    label: "Brittle Nails",
    dimensions: {
      character: ["splitting / cracking (Onychoschizia)", "soft / easily bending", "fragile edges"],
      triggers: ["frequent water / chemical exposure", "aging", "iron deficiency / hypothyroidism"]
    }
  },
  {
    id: "skin_nail_thickening",
    label: "Nail Thickening",
    dimensions: {
      character: ["hyperkeratotic thick nail plate", "dystrophic / crumbling nail"],
      location: ["toenails", "fingernails"],
      associated: ["subungual debris", "psoriatic nail pitting"]
    }
  },
  {
    id: "skin_nail_separation_onycholysis",
    label: "Nail Separation (Onycholysis)",
    dimensions: {
      character: ["detachment of nail plate from nail bed starting distally"],
      triggers: ["trauma", "psoriasis", "fungal infection", "thyroid dysfunction"]
    }
  },

  // ADDITIONAL DERMATOLOGY SYMPTOMS
  {
    id: "skin_peeling_desquamation",
    label: "Skin Peeling (Desquamation)",
    dimensions: {
      location: ["palms and soles", "generalized", "site of prior rash"],
      character: ["fine flaking", "sheet-like peeling / desquamation"]
    },
    redFlags: [
      "Sheet-like desquamation following high fever and hypotension (Toxic Shock Syndrome alert)",
      "Peeling following diffuse painful redness and sun exposure / drug exposure (SJS / TEN alert)"
    ]
  },
  {
    id: "skin_blisters_vesicles_bullae",
    label: "Blisters (Vesicles/Bullae)",
    dimensions: {
      size: ["small fluid-filled bumps (< 0.5 cm - Vesicles)", "large blisters (> 0.5 cm - Bullae)"],
      distribution: ["dermatomal / linear (Herpes Zoster)", "clustered on red base (Herpes Simplex)", "generalized tense or flaccid bullae"],
      content: ["clear fluid", "hemorrhagic / bloody", "purulent"]
    },
    redFlags: [
      "Flaccid blisters that rupture easily leaving painful raw erosions (Pemphigus vulgaris alert)",
      "Widespread blistering with mucosal erosions and fever (SJS / TEN emergency)",
      "Blistering in dermatomal distribution near eye tip of nose (Herpes Zoster Ophthalmicus - Hutchinson's sign)"
    ]
  },
  {
    id: "skin_color_change",
    label: "Skin Color Change",
    dimensions: {
      type: ["hyperpigmentation (darkening)", "hypopigmentation / depigmentation (lightening / vitiligo)", "bronzing", "yellowing (jaundice)", "bluish (cyanosis)"],
      distribution: ["localized patches", "generalized", "creases / palmar creases"]
    },
    redFlags: [
      "Generalized skin bronzing / hyperpigmentation with weakness and hypotension (Addison's disease / Adrenal insufficiency)",
      "Central cyanosis (bluish skin/lips - Severe hypoxia emergency)"
    ]
  },
  {
    id: "skin_new_or_changing_mole",
    label: "New or Changing Mole",
    dimensions: {
      abcde: ["Asymmetry", "Border irregularity", "Color variation (multiple shades)", "Diameter > 6mm", "Evolving (changing size, shape, color, or bleeding)"],
      sensation: ["itchy", "bleeding / crusting", "painful", "asymptomatic"]
    },
    redFlags: [
      "Positive ABCDE criteria on skin lesion (Melanoma suspicion - Urgent dermatologic biopsy required)"
    ],
    requiredExams: [
      "Dermoscopic evaluation",
      "Excisional skin biopsy"
    ]
  }
];

export const MUSCULOSKELETAL_MODELS: SymptomModel[] = [
  {
    id: "msk_joint_pain",
    label: "Joint Pain (Arthralgia)",
    dimensions: {
      location: ["single joint (monoarticular)", "few joints (oligoarticular, 2-4)", "multiple joints (polyarticular, >=5)", "symmetrical", "migratory"],
      character: ["aching", "sharp / stabbing", "throbbing", "burning"],
      timing: ["worse in morning", "worse with weight-bearing / activity", "constant"]
    },
    redFlags: [
      "Hot, red, swollen single joint with fever (Septic arthritis alert)",
      "Joint pain following significant trauma with gross deformity or inability to bear weight"
    ],
    requiredExams: [
      "Joint range of motion and ligamentous stability exam",
      "Inflammatory markers (ESR, CRP)",
      "Joint X-ray / Arthrocentesis if joint effusion present"
    ]
  },
  {
    id: "msk_joint_swelling",
    label: "Joint Swelling",
    dimensions: {
      location: ["knee", "ankle / foot", "wrist / hand / MCP / PIP joints", "shoulder", "hip / elbow"],
      onset: ["acute sudden onset (< 24 hrs)", "gradual / chronic"]
    },
    redFlags: [
      "Acute monarthritis with fever and inability to bear weight (Septic joint until ruled out)"
    ]
  },
  {
    id: "msk_joint_stiffness",
    label: "Joint Stiffness",
    dimensions: {
      timing: ["morning stiffness > 1 hour (inflammatory / RA alert)", "morning stiffness < 30 minutes (osteoarthritis)", "gell phenomenon after rest"],
      affected: ["hands and wrists", "weight-bearing joints", "generalized"]
    }
  },
  {
    id: "msk_joint_redness",
    label: "Joint Redness",
    dimensions: {
      location: ["first MTP (gout / podagra suspicion)", "knee", "elbow / wrist"],
      associated: ["intense warmth", "extreme tenderness to touch / bedsheets"]
    },
    redFlags: [
      "Erythematous warm joint with systemic fever or chills"
    ]
  },
  {
    id: "msk_joint_deformity",
    label: "Joint Deformity",
    dimensions: {
      type: ["ulnar deviation", "Bouchard / Heberden nodes", "swan-neck / boutonnière deformity", "valgus / varus alignment", "post-traumatic deformity"],
      chronicity: ["longstanding gradual", "acute post-injury"]
    }
  },
  {
    id: "msk_joint_instability",
    label: "Joint Instability",
    dimensions: {
      location: ["knee", "shoulder", "ankle", "patella"],
      character: ["feeling of loose joint", "recurrent subluxation / dislocation"]
    }
  },
  {
    id: "msk_joint_locking",
    label: "Joint Locking",
    dimensions: {
      location: ["knee (meniscal tear suspicion)", "finger (trigger finger)", "elbow"],
      character: ["true mechanical locking (cannot extend joint)", "pseudo-locking due to pain"]
    },
    redFlags: [
      "Acute locked knee preventing weight bearing or full extension (Mechanical obstruction alert)"
    ]
  },
  {
    id: "msk_muscle_pain",
    label: "Muscle Pain (Myalgia)",
    dimensions: {
      distribution: ["generalized / diffuse", "localized to specific muscle group", "proximal (shoulders/hips)"],
      character: ["dull ache", "soreness", "burning"],
      triggers: ["post-exercise (DOMS)", "statine use", "viral infection"]
    },
    redFlags: [
      "Severe generalized muscle pain + dark tea-colored urine (Rhabdomyolysis emergency)",
      "Proximal muscle pain and stiffness in elderly > 50 with elevated ESR (Polymyalgia Rheumatica alert)"
    ],
    requiredExams: [
      "Serum Creatine Kinase (CK) and urinalysis for myoglobinuria",
      "ESR and CRP"
    ]
  },
  {
    id: "msk_muscle_cramps",
    label: "Muscle Cramps",
    dimensions: {
      location: ["calves / gastrocnemius", "feet / toes", "thighs"],
      timing: ["nocturnal / at rest", "during intense exercise / sweating"],
      associated: ["electrolyte imbalance suspicion", "dehydration"]
    }
  },
  {
    id: "msk_muscle_spasms",
    label: "Muscle Spasms",
    dimensions: {
      location: ["paraspinal / back", "neck / trapezius", "limbs"],
      character: ["involuntary painful muscle contraction / tightness / guarding"],
      triggers: ["acute strain / injury", "poor posture"]
    }
  },
  {
    id: "msk_muscle_wasting",
    label: "Muscle Wasting (Atrophy)",
    dimensions: {
      location: ["thenar eminence (carpal tunnel)", "quadriceps", "shoulder girdle / deltoid", "distal limb"],
      symmetry: ["unilateral / focal", "bilateral symmetric"]
    },
    redFlags: [
      "Rapid focal muscle atrophy with fasciculations and weakness (Lower motor neuron / ALS concern)"
    ]
  },
  {
    id: "msk_limb_pain",
    label: "Limb Pain",
    dimensions: {
      location: ["upper extremity (arm/forearm/hand)", "lower extremity (thigh/calf/foot)"],
      character: ["deep bone pain", "muscular pain", "vascular claudication pain with exertion"],
      timing: ["with walking / exertion (claudication)", "at rest / nocturnal", "constant"]
    },
    redFlags: [
      "Rest leg pain worse with elevation + cold pale foot (Acute limb ischemia emergency)",
      "Unilateral lower limb pain with localized warmth and calf tenderness (DVT alert)"
    ]
  },
  {
    id: "msk_limb_swelling",
    label: "Limb Swelling",
    dimensions: {
      symmetry: ["unilateral limb swelling", "bilateral symmetric edema"],
      character: ["pitting edema", "non-pitting (lymphedema)", "indurated / red"],
      onset: ["acute onset (< 72 hrs)", "chronic progressive"]
    },
    redFlags: [
      "Acute unilateral leg swelling > 3 cm asymmetry (Deep Vein Thrombosis - urgent compression ultrasound required)",
      "Rapidly spreading limb swelling with bullae and severe pain (Compartment syndrome or necrotizing infection emergency)"
    ],
    requiredExams: [
      "Duplex venous ultrasound of lower extremity",
      "Measurement of limb circumferences"
    ]
  },
  {
    id: "msk_difficulty_walking",
    label: "Difficulty Walking",
    dimensions: {
      gait_type: ["antalgic (pain-avoiding)", "ataxic / wide-based", "spastic / scissoring", "steppage / foot drop"],
      onset: ["acute sudden onset", "gradual progressive"]
    },
    redFlags: [
      "Sudden inability to walk or bear weight (Fracture, cord compression, or acute stroke alert)"
    ]
  },
  {
    id: "msk_limping",
    label: "Limping",
    dimensions: {
      character: ["shortened stance phase on affected side due to pain (antalgic gait)"],
      population: ["pediatric (transient synovitis vs septic hip vs SCFE)", "adult"],
      associated: ["hip pain", "knee pain", "foot pain"]
    }
  },
  {
    id: "msk_difficulty_standing",
    label: "Difficulty Standing",
    dimensions: {
      type: ["difficulty rising from seated position (Gowers sign / proximal weakness)", "inability to maintain upright balance"],
      associated: ["proximal muscle weakness", "severe back or hip pain"]
    }
  },
  {
    id: "msk_difficulty_climbing_stairs",
    label: "Difficulty Climbing Stairs",
    dimensions: {
      character: ["difficulty stepping up (proximal leg weakness / quadriceps / gluteal weakness)", "knee pain on stair descent (patellofemoral)"]
    }
  },
  {
    id: "msk_reduced_range_of_motion",
    label: "Reduced Range of Motion",
    dimensions: {
      affected_joint: ["shoulder (adhesive capsulitis / frozen shoulder)", "hip", "knee", "elbow / wrist"],
      type: ["active and passive restriction", "active restriction only (tendon/muscle injury)"]
    }
  },

  // ADDITIONAL MSK RECOMMENDED SYMPTOMS
  {
    id: "msk_joint_clicking_crepitus",
    label: "Joint Clicking (Crepitus)",
    dimensions: {
      character: ["audible or palpable crunching / grinding / popping sound during joint motion"],
      location: ["knee (patellofemoral)", "shoulder", "hip", "jaw (TMJ)"]
    }
  },
  {
    id: "msk_joint_giving_way",
    label: "Joint Giving Way",
    dimensions: {
      character: ["sudden buckling or collapse of joint under weight-bearing"],
      location: ["knee (ACL / meniscal insufficiency)", "ankle (chronic instability)"]
    }
  },
  {
    id: "msk_muscle_tightness",
    label: "Muscle Tightness",
    dimensions: {
      location: ["hamstrings", "calves", "neck / trapezius", "lower back"],
      character: ["feeling of stiffness / lack of flexibility without frank spasm"]
    }
  },
  {
    id: "msk_difficulty_using_hands",
    label: "Difficulty Using Hands",
    dimensions: {
      impact: ["buttoning shirt", "opening jars", "writing / fine motor tasks"],
      causes: ["small joint arthritis", "carpal tunnel median nerve numbness", "dupuytren contracture"]
    }
  },
  {
    id: "msk_difficulty_grasping_objects",
    label: "Difficulty Grasping Objects",
    dimensions: {
      character: ["reduced grip strength", "dropping items unintentionally"],
      associated: ["hand numbness / tingling", "thumb base osteoarthritis"]
    }
  }
];

export const NEUROLOGICAL_MODELS: SymptomModel[] = [
  // 1. MOTOR SYMPTOMS
  {
    id: "neuro_focal_weakness",
    label: "Focal Weakness",
    dimensions: {
      location: ["one arm / hand", "one leg / foot", "one side of body (hemiparesis)", "facial weakness"],
      onset: ["sudden (seconds to minutes)", "subacute (hours to days)", "gradual (weeks to months)"],
      severity: ["mild clumsiness / drift", "moderate weakness against resistance", "severe / unable to lift limb"]
    },
    redFlags: [
      "Sudden unilateral focal weakness (Acute ischemic / hemorrhagic stroke emergency - code stroke)",
      "Rapidly ascending motor weakness involving respiratory muscles (Guillain-Barré Syndrome emergency)"
    ],
    requiredExams: [
      "Cranial nerve and localized motor strength grading (0-5 scale)",
      "Emergent non-contrast CT brain or MRI stroke protocol"
    ]
  },
  {
    id: "neuro_paralysis",
    label: "Paralysis",
    dimensions: {
      type: ["monoplegia (single limb)", "hemiplegia (one side of body)", "paraplegia (both lower extremities)", "tetraplegia / quadriplegia (all four limbs)"],
      character: ["flaccid (loss of tone / reflexes)", "spastic (hypertonia / hyperreflexia)"]
    },
    redFlags: [
      "Acute paralysis with sensory level and bowel/bladder dysfunction (Acute spinal cord compression / cord infarction emergency)"
    ],
    requiredExams: [
      "Urgent spine and brain MRI",
      "Emergency neurological and neurosurgical consult"
    ]
  },
  {
    id: "neuro_loss_of_coordination",
    label: "Loss of Coordination (Ataxia)",
    dimensions: {
      type: ["gait ataxia (staggering / wide-based walk)", "limb ataxia (dysmetria / intention tremor)", "truncal ataxia (unsteady sitting)"],
      onset: ["acute sudden onset", "subacute", "chronic progressive"]
    },
    redFlags: [
      "Acute ataxia with severe headache, vomiting, or altered consciousness (Cerebellar stroke / hemorrhage emergency)"
    ]
  },
  {
    id: "neuro_muscle_stiffness",
    label: "Muscle Stiffness",
    dimensions: {
      character: ["spasticity (velocity-dependent clasp-knife)", "rigidity (lead-pipe or cogwheel)", "paratonia"],
      associated: ["slowness of movement (bradykinesia)", "painful flexor spasms"]
    }
  },
  {
    id: "neuro_muscle_twitching",
    label: "Muscle Twitching (Fasciculations)",
    dimensions: {
      location: ["calves / legs", "arms / shoulders", "tongue", "eyelids", "generalized"],
      frequency: ["episodic / benign", "persistent / widespread"]
    },
    redFlags: [
      "Widespread fasciculations accompanied by muscle atrophy and weakness (Amyotrophic Lateral Sclerosis / ALS concern)"
    ]
  },
  {
    id: "neuro_tremor",
    label: "Tremor",
    dimensions: {
      type: ["resting tremor (4-6 Hz pill-rolling)", "postural / action tremor (essential tremor)", "intention tremor (cerebellar)"],
      location: ["hands / fingers", "head / chin", "voice", "legs"]
    }
  },
  {
    id: "neuro_involuntary_movements",
    label: "Involuntary Movements",
    dimensions: {
      type: ["chorea (rapid irregular dancing movements)", "athetosis (slow writhing)", "dystonia (sustained twisting postures)", "myoclonus (shock-like jerks)", "tics"],
      distribution: ["focal / segmental", "generalized"]
    }
  },
  {
    id: "neuro_abnormal_gait",
    label: "Abnormal Gait",
    dimensions: {
      gait_pattern: ["parkinsonian (shuffling, festinating, stooped)", "hemiparetic (circumduction)", "steppage gait (foot drop)", "wide-based / ataxic", "spastic / scissoring"]
    }
  },

  // 2. SENSORY SYMPTOMS
  {
    id: "neuro_numbness",
    label: "Numbness",
    dimensions: {
      distribution: ["dermatomal (nerve root distribution)", "glove and stocking (distal polyneuropathy)", "hemisensory (one side of body)", "saddle distribution (perianal)"],
      onset: ["sudden acute", "gradual progressive"]
    },
    redFlags: [
      "Saddle numbness in perianal / groin region with urinary retention (Cauda Equina Syndrome emergency)",
      "Sudden unilateral hemisensory loss (Stroke alert)"
    ]
  },
  {
    id: "neuro_tingling",
    label: "Tingling (Paresthesia)",
    dimensions: {
      distribution: ["fingertips / hands", "toes / feet", "perioral / face", "single nerve territory"],
      triggers: ["positional pressure", "hyperventilation", "cold temperature"]
    }
  },
  {
    id: "neuro_burning_sensation",
    label: "Burning Sensation",
    dimensions: {
      location: ["soles of feet / toes (small fiber neuropathy)", "along dermatome (post-herpetic)", "hands"],
      timing: ["worse at night / disturbing sleep"]
    }
  },
  {
    id: "neuro_neuralgic_pain",
    label: "Neuralgic Pain",
    dimensions: {
      character: ["sharp electric shock-like", "stabbing / lancinating", "shooting pain"],
      location: ["trigeminal distribution (face V1/V2/V3)", "intercostal", "occipital"]
    },
    redFlags: [
      "Intense trigeminal neuralgia preventing fluid and food intake"
    ]
  },
  {
    id: "neuro_loss_of_sensation",
    label: "Loss of Sensation",
    dimensions: {
      modality: ["loss of pinprick / pain sensation", "loss of light touch", "complete sensory loss zone"],
      distribution: ["distal extremities", "focal spinal level", "unilateral"]
    }
  },
  {
    id: "neuro_electric_shock_sensation",
    label: "Electric Shock Sensation",
    dimensions: {
      triggers: ["neck flexion shooting down spine and limbs (Lhermitte sign)", "light tactile stimulation (allodynia)"]
    },
    redFlags: [
      "Positive Lhermitte sign indicative of cervical spinal cord pathology / demyelination"
    ]
  },
  {
    id: "neuro_reduced_temperature_sensation",
    label: "Reduced Sensation to Temperature",
    dimensions: {
      location: ["feet / legs", "hands", "dissociated loss (lost thermal/pain with intact touch)"]
    },
    redFlags: [
      "Dissociated sensory loss suggestive of syringomyelia or anterior spinal cord syndrome"
    ]
  },
  {
    id: "neuro_reduced_vibration_sensation",
    label: "Reduced Sensation to Vibration",
    dimensions: {
      location: ["great toes", "malleoli", "tibial tuberosity", "fingers"],
      associated: ["loss of proprioception / joint position sense / sensory ataxia"]
    }
  },

  // 3. COORDINATION, BALANCE & EPISODIC SYMPTOMS
  {
    id: "neuro_dizziness",
    label: "Dizziness",
    dimensions: {
      character: ["lightheadedness / presyncope", "giddiness / unsteadiness", "floating sensation"],
      triggers: ["standing up (orthostatic)", "dehydration", "hyperventilation"]
    }
  },
  {
    id: "neuro_vertigo",
    label: "Vertigo",
    dimensions: {
      type: ["peripheral vertigo (spinning with horizontal fatiguable nystagmus)", "central vertigo (spinning or tilting with vertical or non-fatiguable nystagmus)"],
      duration: ["seconds (< 1 min - BPPV)", "hours (Meniere's disease)", "days (vestibular neuritis / labyrinthitis)"],
      triggers: ["head position changes", "spontaneous"]
    },
    redFlags: [
      "Central vertigo with abnormal HINTS exam, ataxia, or inability to stand unaided (Posterior circulation stroke alert)"
    ],
    requiredExams: [
      "HINTS examination (Head Impulse, Nystagmus, Test of Skew)",
      "Dix-Hallpike positional testing"
    ]
  },
  {
    id: "neuro_loss_of_balance",
    label: "Loss of Balance",
    dimensions: {
      character: ["veering to one side when walking", "retropulsion / falling backwards", "unsteadiness in dark (positive Romberg test)"],
      frequency: ["recurrent falls", "near-falls"]
    }
  },
  {
    id: "neuro_seizures",
    label: "Seizures",
    dimensions: {
      type: ["generalized tonic-clonic", "focal aware / focal impaired awareness", "absence staring spells"],
      phase: ["post-ictal confusion / lethargy", "tongue biting (lateral)", "urinary or fecal incontinence"],
      frequency: ["first-time episode", "recurrent known epilepsy"]
    },
    redFlags: [
      "First-ever seizure in an adult",
      "Status epilepticus (continuous seizure > 5 mins or discrete seizures without regaining consciousness)",
      "Seizure accompanied by fever, head trauma, or persistent focal deficit (Todd's paralysis)"
    ],
    requiredExams: [
      "Electroencephalogram (EEG)",
      "Neuroimaging (Brain MRI or non-contrast head CT)",
      "Serum glucose, electrolytes, calcium, magnesium, toxicology screen"
    ]
  },
  {
    id: "neuro_aura",
    label: "Aura",
    dimensions: {
      type: ["visual aura (scintillating scotoma, flashing lights, zigzag lines)", "sensory aura (marching tingling)", "dysphasic aura", "olfactory / gustatory aura (foul odor / metallic taste)"],
      duration: ["5 to 60 minutes prior to headache or seizure"]
    }
  },

  // 4. HIGHER CORTICAL FUNCTIONS
  {
    id: "neuro_memory_loss",
    label: "Memory Loss",
    dimensions: {
      type: ["short-term memory impairment (forgetting recent conversations/events)", "long-term memory loss", "procedural memory decline"],
      onset: ["acute (transient global amnesia)", "subacute (rapidly progressive dementia)", "gradual insidious over years"]
    },
    redFlags: [
      "Rapidly progressive memory loss over weeks to months (Prion disease / Autoimmune encephalitis alert)"
    ]
  },
  {
    id: "neuro_confusion",
    label: "Confusion",
    dimensions: {
      onset: ["acute fluctuating onset (delirium alert)", "chronic progressive (dementia)"],
      associated: ["agitation", "hallucinations", "lethargy / drowsiness"]
    },
    redFlags: [
      "Acute confusion with fever and stiff neck (Meningitis / Encephalitis emergency)",
      "Acute confusion in patient with hypoglycemia, severe hypoxia, or sepsis"
    ],
    requiredExams: [
      "Confusion Assessment Method (CAM) for delirium",
      "Blood glucose, metabolic panel, oxygen saturation, toxicology screen"
    ]
  },
  {
    id: "neuro_disorientation",
    label: "Disorientation",
    dimensions: {
      sphere: ["disoriented to time (date/season)", "disoriented to place (current location)", "disoriented to person (self/family)"]
    }
  },
  {
    id: "neuro_difficulty_concentrating",
    label: "Difficulty Concentrating",
    dimensions: {
      character: ["short attention span", "brain fog", "inability to complete complex tasks"],
      causes: ["sleep deprivation", "post-concussion syndrome", "long COVID", "depression"]
    }
  },
  {
    id: "neuro_difficulty_finding_words",
    label: "Difficulty Finding Words",
    dimensions: {
      character: ["anomia / word-finding pauses", "circumlocution (describing objects rather than naming them)"]
    }
  },
  {
    id: "neuro_difficulty_understanding_speech",
    label: "Difficulty Understanding Speech",
    dimensions: {
      character: ["receptive language impairment / auditory comprehension loss", "spoken words sound meaningless"]
    },
    redFlags: [
      "Sudden onset receptive language loss (Wernicke aphasia due to dominant temporal stroke alert)"
    ]
  },
  {
    id: "neuro_difficulty_reading",
    label: "Difficulty Reading",
    dimensions: {
      character: ["alexia / inability to comprehend written text despite intact vision"]
    }
  },
  {
    id: "neuro_difficulty_writing",
    label: "Difficulty Writing",
    dimensions: {
      character: ["agraphia / inability to formulate written sentences or spell words"]
    }
  },

  // 5. SPEECH, LANGUAGE & CRANIAL NERVE SYMPTOMS
  {
    id: "neuro_dysarthria",
    label: "Dysarthria",
    dimensions: {
      character: ["slurred speech / thick-tongued", "scanning speech (cerebellar)", "monotone / quiet (parkinsonian)", "hypernasal speech (bulbar palsy)"],
      onset: ["sudden acute", "gradual progressive"]
    },
    redFlags: [
      "Sudden dysarthria with facial weakness or arm drift (Stroke emergency)"
    ]
  },
  {
    id: "neuro_aphasia",
    label: "Aphasia",
    dimensions: {
      type: ["expressive aphasia (Broca - non-fluent, halting)", "receptive aphasia (Wernicke - fluent nonsense)", "global aphasia"],
      onset: ["sudden acute onset", "progressive"]
    },
    redFlags: [
      "Sudden acute onset aphasia (Ischemic stroke in dominant hemisphere emergency)"
    ]
  },
  {
    id: "neuro_facial_weakness",
    label: "Facial Weakness",
    dimensions: {
      pattern: ["lower face only spared forehead (UMN central stroke pattern)", "entire half of face including forehead and eye closure (LMN Bell's palsy pattern)"],
      onset: ["sudden"]
    },
    redFlags: [
      "Sudden lower facial weakness with forehead sparing or limb weakness (Central stroke alert)"
    ]
  },
  {
    id: "neuro_difficulty_chewing",
    label: "Difficulty Chewing",
    dimensions: {
      character: ["masticatory muscle fatigue (trigeminal motor / myasthenia gravis)", "jaw claudication (pain when chewing)"]
    },
    redFlags: [
      "Jaw claudication in patient age > 50 (Giant Cell Arteritis alert - vision loss risk)"
    ]
  },
  {
    id: "neuro_difficulty_closing_eye",
    label: "Difficulty Closing the Eye",
    dimensions: {
      side: ["unilateral lagophthalmos (CN VII palsy)", "bilateral"],
      complication: ["corneal dryness / exposure keratitis / eye pain"]
    }
  },
  {
    id: "neuro_febrile_seizure",
    label: "Febrile Seizure",
    dimensions: {
      type: ["simple febrile seizure (< 15 mins, generalized, single episode in 24h)", "complex febrile seizure (> 15 mins, focal, or > 1 episode in 24h)"],
      temperature: ["fever >= 38.0°C (100.4°F)"],
      postIctal: ["rapid return to baseline consciousness", "prolonged post-ictal drowsiness / confusion"],
      age: ["6 months to 5 years (classic febrile seizure range)"]
    },
    redFlags: [
      "Complex febrile seizure features (focal seizure onset, duration > 15 mins, or multiple seizures in 24h)",
      "Persistent neck stiffness, bulging fontanelle, or lethargy (Meningitis / Encephalitis alert)",
      "Seizure in infant < 6 months or child > 5 years old"
    ]
  },
  {
    id: "neuro_altered_consciousness",
    label: "Altered Consciousness",
    dimensions: {
      level: ["somnolence / drowsiness", "obtundation", "stupor", "coma / unresponsive"],
      onset: ["sudden acute (trauma / stroke / seizure / toxin)", "subacute / progressive (metabolic / infection)"],
      associated: ["fever", "focal neurological deficit", "head trauma", "hypoglycemia"]
    },
    redFlags: [
      "Rapidly deteriorating Glasgow Coma Scale (GCS)",
      "Asymmetric pupils or decerebrate/decorticate posturing",
      "Altered consciousness with fever and purpuric rash (Meningococcemia emergency)"
    ]
  }
];

export const GENERAL_MODELS: SymptomModel[] = [
  {
    id: "gen_fever",
    label: "Fever",
    dimensions: {
      severity: ["low-grade", "high (>103F/39.4C)", "fluctuating"],
      duration: ["acute (days)", "persistent (weeks)"],
      associated: ["chills/shivering", "sweating", "headache", "body aches"]
    },
    redFlags: ["Fever + stiff neck", "Fever in immunocompromised"]
  },
  {
    id: "gen_shaking_chills",
    label: "Chills (Rigors)",
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
    label: "Fatigue",
    dimensions: {
      severity: ["mild", "interferes with work", "unable to get out of bed"],
      relief: ["improves with rest", "unrelieved by sleep"]
    },
    redFlags: ["Sudden extreme fatigue", "Associated with shortness of breath"]
  },
  {
    id: "gen_malaise",
    label: "Malaise",
    dimensions: { character: ["feeling 'off'", "vague illness"], associated: ["fever", "body aches"] }
  },
  {
    id: "gen_weakness_generalized",
    label: "Generalized Weakness",
    dimensions: { location: ["entire body", "limbs"], onset: ["sudden", "gradual"] },
    redFlags: ["Sudden inability to move limbs"]
  },
  {
    id: "gen_weight_loss",
    label: "Weight Loss",
    dimensions: {
      amount: ["<5%", "5-10%", ">10% of body weight"],
      timeframe: ["weeks", "months"],
      appetite: ["increased", "decreased", "normal"]
    },
    redFlags: ["Rapid weight loss > 10% in 6 months"]
  },
  {
    id: "gen_weight_gain",
    label: "Weight Gain",
    dimensions: { timeframe: ["days (fluid)", "months (fat/metabolic)"], associated: ["swelling", "shortness of breath"] }
  },
  {
    id: "gen_appetite_loss",
    label: "Loss of Appetite (Anorexia)",
    dimensions: { severity: ["mild", "complete refusal of food"], associated: ["nausea", "weight loss"] }
  },
  {
    id: "gen_stamina_reduced",
    label: "Reduced Stamina",
    dimensions: { duration: ["recent", "chronic"], impact: ["ADLs", "work", "hobbies"] }
  },
  {
    id: "gen_flulike_symptoms",
    label: "Flu-like Symptoms",
    dimensions: { character: ["feverish", "myalgias", "fatigue", "chills", "headache"] }
  },
  {
    id: "gen_lethargy",
    label: "Lethargy",
    dimensions: {
      onset: ["acute onset", "gradual progressive", "intermittent"],
      responsiveness: ["arousable to voice", "arousable only to physical stimulation", "floppy / sluggish"],
      associated: ["fever", "poor feeding / anorexia", "confusion", "headache"]
    },
    redFlags: [
      "Unresponsiveness or Glasgow Coma Scale drop",
      "Lethargy with stiff neck or petechial rash",
      "Delayed capillary refill with cold extremities"
    ]
  },
  {
    id: "gen_dehydration",
    label: "Dehydration",
    dimensions: {
      severity: ["mild (thirst, slightly dry mouth)", "moderate (sunken eyes, dry mucous membranes, reduced tears)", "severe (sunken fontanelle, delayed cap refill, lethargy)"],
      cause: ["vomiting", "diarrhea", "excessive sweating", "inadequate oral fluid intake", "fever"],
      urine_output: ["normal", "decreased / dark urine", "no urine output > 8-12 hours (anuria)"]
    },
    redFlags: [
      "Severe dehydration with hypovolemic shock (tachycardia, hypotension, cold extremities)",
      "Anuria > 12 hours",
      "Inability to tolerate oral rehydration therapy"
    ]
  }
];

export const MALE_MODELS: SymptomModel[] = [
  // 1. ERECTILE & LIBIDO SYMPTOMS
  {
    id: "male_difficulty_achieving_erection",
    label: "Difficulty Achieving Erection",
    dimensions: {
      onset: ["gradual progressive (vascular / neurogenic / endocrine)", "sudden onset (psychogenic / trauma)"],
      timing: ["constant in all settings", "selective (preserved morning erections / masturbation)"],
      associated: ["decreased libido", "pelvic trauma", "cardiovascular disease", "diabetes"]
    },
    requiredExams: [
      "Morning serum Total Testosterone, Fasting Lipid Panel, Fasting Glucose / HbA1c",
      "Penile Doppler ultrasound if vascular etiology suspected"
    ]
  },
  {
    id: "male_difficulty_maintaining_erection",
    label: "Difficulty Maintaining Erection",
    dimensions: {
      character: ["losing erection prematurely during intercourse (venous leak / anxiety)"],
      associated: ["performance anxiety", "lower urinary tract symptoms (LUTS)", "antihypertensive or SSRI medication use"]
    }
  },
  {
    id: "male_decreased_libido",
    label: "Decreased Libido",
    dimensions: {
      onset: ["gradual decline with age", "abrupt drop"],
      associated: ["fatigue", "depressed mood", "loss of muscle mass", "erectile dysfunction"]
    },
    requiredExams: [
      "Morning Total and Free Testosterone, Prolactin, TSH, SHBG"
    ]
  },
  {
    id: "male_pain_during_erection",
    label: "Pain During Erection",
    dimensions: {
      character: ["sharp pain with tumescence", "dorsal or lateral penile pain"],
      associated: ["penile curvature / fibrous plaque (Peyronie disease)", "recent intercourse trauma"]
    }
  },
  {
    id: "male_persistent_erection",
    label: "Persistent Erection (Priapism)",
    dimensions: {
      duration: ["> 4 hours (medical emergency)", "stuttering recurrent episodes"],
      type: ["ischemic / veno-occlusive (painful, rigid shaft with soft glans)", "non-ischemic / arterial (painless, semi-rigid post-trauma)"],
      triggers: ["sickle cell trait/disease", "intracavernosal injections", "trazodone or antipsychotic medication"]
    },
    redFlags: [
      "Ischemic priapism lasting > 4 hours (Risk of permanent cavernosal fibrosis and irreversible erectile loss - EMERGENCY UROLOGICAL DRAINAGE REQUIRED)"
    ],
    requiredExams: [
      "STAT Penile cavernosal blood gas analysis (Aspirate pH, pO2, pCO2)",
      "Color Doppler ultrasound of penis"
    ]
  },

  // 2. EJACULATORY SYMPTOMS
  {
    id: "male_premature_ejaculation",
    label: "Premature Ejaculation",
    dimensions: {
      onset: ["lifelong (primary - always < 1 min intravaginal ejaculatory latency)", "acquired (secondary - previous normal control)"],
      impact: ["significant distress and interpersonal difficulty"]
    }
  },
  {
    id: "male_delayed_ejaculation",
    label: "Delayed Ejaculation",
    dimensions: {
      character: ["inability to ejaculate despite adequate stimulation or marked delay (> 30-45 mins)"],
      causes: ["SSRI medication side effect", "diabetic neuropathy", "psychological anxiety"]
    }
  },
  {
    id: "male_painful_ejaculation",
    label: "Painful Ejaculation",
    dimensions: {
      location: ["perineal pain", "penile shaft pain", "testicular / scrotal ache during or immediately post-ejaculation"],
      causes: ["prostatitis", "ejaculatory duct obstruction", "pudendal neuralgia"]
    },
    requiredExams: [
      "Urinalysis, post-prostatic massage urine culture or semen culture",
      "Transrectal ultrasound (TRUS) for ejaculatory duct cysts"
    ]
  },
  {
    id: "male_blood_in_semen",
    label: "Blood in Semen (Hematospermia)",
    dimensions: {
      color: ["bright red blood", "dark brownish old blood"],
      frequency: ["single episode (often benign / post-prostate biopsy)", "recurrent persistent"],
      age_group: ["< 40 years (most commonly inflammatory/infectious)", "> 50 years (evaluate for prostate pathology)"]
    },
    redFlags: [
      "Recurrent hematospermia in men > 50 with elevated PSA or abnormal digital rectal exam (Prostate malignancy screening required)"
    ],
    requiredExams: [
      "Serum Prostate-Specific Antigen (PSA) and Digital Rectal Exam (DRE)",
      "Urinalysis and STI testing (Chlamydia / Gonorrhea)"
    ]
  },
  {
    id: "male_reduced_ejaculate_volume",
    label: "Reduced Ejaculate Volume",
    dimensions: {
      character: ["noticable decrease in volume of fluid ejaculated (< 1.5 mL)"],
      causes: ["retrograde ejaculation (alpha-blocker or post-TURP)", "hypogonadism", "partial ejaculatory duct obstruction"]
    }
  },
  {
    id: "male_absent_ejaculation",
    label: "Absent Ejaculation (Anejaculation)",
    dimensions: {
      character: ["orgasm achieved without any semen release (dry orgasm)"],
      type: ["retrograde ejaculation into bladder", "true failure of emission (sympathetic nerve injury / spinal cord)"]
    },
    requiredExams: [
      "Post-ejaculatory urinalysis (presence of sperm in urine confirms retrograde ejaculation)"
    ]
  },

  // 3. TESTICULAR & SCROTAL SYMPTOMS
  {
    id: "male_testicular_pain",
    label: "Testicular Pain",
    dimensions: {
      onset: ["acute sudden severe pain (Testicular Torsion alert)", "gradual onset ache (Epididymitis / Orchitis)"],
      laterality: ["unilateral right", "unilateral left", "bilateral"],
      associated: ["nausea / vomiting", "fever", "scrotal swelling", "dysuria"]
    },
    redFlags: [
      "Sudden onset unilateral severe testicular pain with high-riding horizontal testicle and absent cremasteric reflex (Testicular Torsion Emergency - 6-hour ischemia window)",
      "Severe testicular pain post-trauma with scrotal ecchymosis (Testicular rupture alert)"
    ],
    requiredExams: [
      "STAT Color Doppler Scrotal Ultrasound",
      "Physical exam: Cremasteric reflex and Prehn sign assessment",
      "Urinalysis and urine nucleic acid amplification test (NAAT) for Chlamydia/Gonorrhea"
    ]
  },
  {
    id: "male_testicular_swelling",
    label: "Testicular Swelling",
    dimensions: {
      onset: ["rapid swelling over hours", "gradual progressive enlargement over months"],
      pain: ["painful swelling (orchitis / epididymitis)", "painless swelling (hydrocele / spermatocele)"]
    },
    redFlags: [
      "Rapid painless enlarged swollen testicle (Germ cell tumor concern until proven otherwise)"
    ]
  },
  {
    id: "male_testicular_lump",
    label: "Testicular Lump",
    dimensions: {
      location: ["intratesticular (within parenchymal body)", "extratesticular (epididymis / cord)"],
      consistency: ["hard rock-like painless nodule", "soft cystic mass (spermatocele)"],
      transillumination: ["transilluminates light (hydrocele/spermatocele)", "does not transilluminate (solid tumor)"]
    },
    redFlags: [
      "Firm, painless, non-transilluminating intratesticular mass (High concern for Testicular Carcinoma)"
    ],
    requiredExams: [
      "High-resolution Scrotal Ultrasound",
      "Serum Tumor Markers: Alpha-fetoprotein (AFP), Beta-hCG, Lactate Dehydrogenase (LDH)"
    ]
  },
  {
    id: "male_undescended_testicle",
    label: "Retractile / Undescended Testicle",
    dimensions: {
      location: ["empty hemiscrotum with palpated groin mass", "testicle manually reducible into scrotum"],
      age: ["pediatric", "adult history of cryptorchidism"]
    }
  },
  {
    id: "male_scrotal_pain",
    label: "Scrotal Pain",
    dimensions: {
      character: ["dull heavy dragging ache in scrotum", "sharp stabbing pain"],
      aggravating: ["worse with prolonged standing or physical exertion (Varicocele)"],
      relief: ["relieved when lying supine"]
    }
  },
  {
    id: "male_scrotal_swelling",
    label: "Scrotal Swelling",
    dimensions: {
      type: ["bag of worms sensation (Varicocele)", "fluid filled sac (Hydrocele)", "scrotal hernia"],
      laterality: ["left-sided (varicocele standard)", "right-sided isolated (Rule out retroperitoneal mass compression)"]
    },
    redFlags: [
      "Sudden onset right-sided isolated varicocele in an adult (Retroperitoneal / Renal Cell Carcinoma vascular compression alert)"
    ]
  },
  {
    id: "male_scrotal_rash",
    label: "Scrotal Rash",
    dimensions: {
      character: ["erythematous scaling rash", "intensely pruritic rash", "blistering / erosions"],
      causes: ["tinea cruris (jock itch)", "contact dermatitis", "scabies", "Fournier gangrene precursor"]
    },
    redFlags: [
      "Scrotal erythema with severe pain out of proportion, crepitus, and systemic toxicity (Fournier Gangrene necrotizing fasciitis emergency)"
    ]
  },

  // 4. PENILE SYMPTOMS
  {
    id: "male_penile_pain",
    label: "Penile Pain",
    dimensions: {
      location: ["glans", "meatus", "shaft", "foreskin"],
      context: ["flaccid pain", "pain during intercourse / erection"]
    }
  },
  {
    id: "male_penile_swelling",
    label: "Penile Swelling",
    dimensions: {
      location: ["edema of foreskin / prepuce (Phimosis / Paraphimosis)", "diffuse shaft hematoma ('eggplant deformity')"],
      triggers: ["trauma during vigorous intercourse", "forced reduction of tight foreskin"]
    },
    redFlags: [
      "Inability to return retracted foreskin over glans with glans congestion/cyanosis (Paraphimosis Emergency)",
      "Sudden cracking sound, loss of erection, and severe penile swelling during intercourse (Penile Fracture Emergency)"
    ],
    requiredExams: [
      "Immediate urological surgical consult for penile fracture or paraphimosis reduction"
    ]
  },
  {
    id: "male_penile_discharge",
    label: "Penile Discharge",
    dimensions: {
      character: ["profuse purulent yellow/green discharge (Gonorrhea pattern)", "scanty clear / mucoid discharge (Chlamydia / NGU pattern)", "bloody"],
      associated: ["dysuria", "meatal erythema and itching"]
    },
    requiredExams: [
      "Urine First-catch NAAT for Neisseria gonorrhoeae and Chlamydia trachomatis",
      "Urethral swab Gram stain / microscopy"
    ]
  },
  {
    id: "male_penile_lesions",
    label: "Penile Lesions",
    dimensions: {
      type: ["cauliflower-like verrucous papules (Condyloma acuminata / HPV)", "clustered vesicles on erythematous base (Herpes Simplex)", "pearly penile papules"],
      pain: ["painful", "painless"]
    }
  },
  {
    id: "male_penile_ulcers",
    label: "Penile Ulcers",
    dimensions: {
      character: ["painless indurated single ulcer / chancre (Primary Syphilis)", "painful shallow erythematous base ulcers (HSV)", "painful ulcer with suppurative inguinal adenopathy (Chancroid)"],
      duration: ["acute (< 2 weeks)", "non-healing chronic lesion (Penile squamous cell carcinoma alert)"]
    },
    redFlags: [
      "Non-healing exophytic or ulcerative penile glans mass in uncircumcised elderly male (Penile Carcinoma concern)"
    ],
    requiredExams: [
      "Syphilis serology (RPR / VDRL and Treponemal antibody test)",
      "HSV 1/2 PCR swab from ulcer base"
    ]
  },
  {
    id: "male_penile_curvature",
    label: "Penile Curvature",
    dimensions: {
      type: ["acquired painful or painless curvature during erection (Peyronie disease)", "congenital penile curvature"],
      plaque: ["palpable fibrous plaque on penile shaft"]
    }
  },

  // 5. REPRODUCTIVE & FERTILITY
  {
    id: "male_infertility",
    label: "Infertility",
    dimensions: {
      duration: ["failure to conceive after 12 months of regular unprotected intercourse"],
      associated: ["history of cryptorchidism", "varicocele", "prior mumps orchitis", "chemotherapy / radiation history"]
    },
    requiredExams: [
      "Semen Analysis (Volume, Concentration, Motility, Morphology)",
      "Serum FSH, LH, Total Testosterone, Prolactin"
    ]
  }
];

export const FEMALE_MODELS: SymptomModel[] = [
  {
    id: "female_amenorrhea",
    label: "Amenorrhea (Absent Menstrual Periods)",
    dimensions: {
      type: ["primary (never started by age 15)", "secondary (stopped for >= 3 months)"],
      associated: ["pregnancy suspicion", "excessive exercise / low body weight", "severe stress", "hot flashes", "headaches / visual changes"]
    },
    redFlags: [
      "Amenorrhea with severe acute pelvic pain (Ectopic pregnancy threat)",
      "Amenorrhea with headaches and visual field loss (Pituitary adenoma concern)",
      "Secondary amenorrhea with galactorrhea"
    ],
    requiredExams: [
      "Urine pregnancy test (hCG)",
      "Serum TSH, prolactin, FSH/LH levels"
    ]
  },
  {
    id: "female_irregular_menstrual_cycles",
    label: "Irregular Menstrual Cycles",
    dimensions: {
      pattern: ["infrequent (oligomenorrhea)", "frequent / short cycles (< 21 days)", "unpredictable cycle length"],
      associated: ["acne", "excess facial/body hair (hirsutism)", "weight fluctuations"]
    }
  },
  {
    id: "female_heavy_menstrual_bleeding",
    label: "Heavy Menstrual Bleeding",
    dimensions: {
      severity: ["soaking >= 1 pad/tampon per hour for consecutive hours", "passing large blood clots (> size of a quarter)", "bleeding lasting > 7 days"],
      associated: ["fatigue / pallor (anemia symptoms)", "postural dizziness"]
    },
    redFlags: [
      "Heavy bleeding causing postural dizziness, syncope, or hemodynamic instability",
      "Heavy bleeding in postmenopausal female"
    ],
    requiredExams: [
      "Complete Blood Count (CBC) and ferritin",
      "Pelvic ultrasound (transvaginal)"
    ]
  },
  {
    id: "female_light_menstrual_bleeding",
    label: "Light Menstrual Bleeding",
    dimensions: {
      character: ["scanty flow / spotting only", "reduced number of bleeding days"],
      triggers: ["hormonal contraception", "perimenopause", "thyroid dysfunction"]
    }
  },
  {
    id: "female_intermenstrual_bleeding",
    label: "Intermenstrual Vaginal Bleeding",
    dimensions: {
      character: ["spotting between normal periods", "light bleeding mid-cycle"],
      triggers: ["missed oral contraceptive", "ovulation", "IUD presence"]
    },
    redFlags: [
      "Persistent bleeding between cycles (Cervical or endometrial pathology alert)"
    ]
  },
  {
    id: "female_postmenopausal_bleeding",
    label: "Postmenopausal Bleeding",
    dimensions: {
      character: ["any vaginal bleeding or spotting >= 12 months after menopause"],
      onset: ["single episode", "recurrent"]
    },
    redFlags: [
      "Postmenopausal bleeding requires urgent endometrial biopsy / ultrasound to rule out endometrial carcinoma"
    ],
    requiredExams: [
      "Transvaginal ultrasound for endometrial thickness",
      "Endometrial biopsy"
    ]
  },
  {
    id: "female_dysmenorrhea",
    label: "Painful Menstruation (Dysmenorrhea)",
    dimensions: {
      type: ["primary (since menarche)", "secondary (new onset or worsening in adult)"],
      character: ["cramping lower abdominal pain", "radiating to lower back/thighs"],
      associated: ["nausea", "diarrhea", "headache"]
    },
    redFlags: [
      "Severe dysmenorrhea unmanageable with NSAIDs (Endometriosis / Fibroids / Adenomyosis evaluation)"
    ]
  },
  {
    id: "female_pelvic_pain",
    label: "Pelvic Pain",
    dimensions: {
      onset: ["acute sudden onset", "chronic (> 6 months)"],
      character: ["sharp / stabbing", "dull ache", "throbbing"],
      timing: ["cyclical with menses", "non-cyclical", "postcoital"]
    },
    redFlags: [
      "Acute severe pelvic pain + fever + purulent discharge (Pelvic Inflammatory Disease / Tubo-ovarian abscess)",
      "Sudden acute severe unilateral pelvic pain with nausea (Ovarian torsion emergency)",
      "Severe pain in early pregnancy (Ectopic pregnancy emergency)"
    ],
    requiredExams: [
      "Bimanual pelvic examination",
      "Transvaginal pelvic ultrasound",
      "Cervical swab PCR for Chlamydia and Gonorrhea"
    ]
  },
  {
    id: "female_pelvic_pressure",
    label: "Pelvic Pressure",
    dimensions: {
      sensation: ["fullness in lower abdomen", "feeling of heaviness / falling out"],
      associated: ["visible or palpable vaginal bulge (Pelvic Organ Prolapse)", "urinary frequency", "constipation"]
    }
  },
  {
    id: "female_vaginal_discharge",
    label: "Vaginal Discharge",
    dimensions: {
      character: ["thick white clumpy / curd-like (Candida)", "thin gray-white with fishy odor (BV)", "yellow-green frothy (Trichomonas)", "clear / mucoid"],
      associated: ["itching", "burning", "vulvar erythema"]
    }
  },
  {
    id: "female_vaginal_itching",
    label: "Vaginal Itching",
    dimensions: {
      location: ["vulvar", "internal vaginal"],
      severity: ["mild", "intense / disturbing sleep"],
      triggers: ["hygiene products", "antibiotic use", "tight clothing"]
    }
  },
  {
    id: "female_vaginal_dryness",
    label: "Vaginal Dryness",
    dimensions: {
      triggers: ["menopause / low estrogen", "postpartum / breastfeeding", "antihistamine use"],
      associated: ["burning sensation", "painful intercourse"]
    }
  },
  {
    id: "female_dyspareunia",
    label: "Dyspareunia (Pain During Intercourse)",
    dimensions: {
      location: ["superficial (at entrance)", "deep pelvic pain on thrusting"],
      associated: ["vaginal dryness", "postcoital bleeding", "pelvic pain"]
    },
    redFlags: [
      "Deep dyspareunia with fever or acute pelvic mass"
    ]
  },
  {
    id: "female_breast_pain",
    label: "Breast Pain",
    dimensions: {
      type: ["cyclical (worse prior to menses)", "non-cyclical"],
      location: ["unilateral", "bilateral"],
      character: ["dull ache", "burning", "stabbing"]
    }
  },
  {
    id: "female_breast_lump",
    label: "Breast Lump",
    dimensions: {
      character: ["hard / fixed", "soft / mobile", "painful", "painless"],
      location: ["upper outer quadrant", "periareolar", "axilla"],
      onset: ["newly noticed", "changing size"]
    },
    redFlags: [
      "Hard, fixed, painless breast mass",
      "Associated skin dimpling or peau d'orange appearance",
      "Nipple retraction or inversion"
    ],
    requiredExams: [
      "Clinical breast exam",
      "Diagnostic mammogram and breast ultrasound"
    ]
  },
  {
    id: "female_breast_swelling",
    label: "Breast Swelling",
    dimensions: {
      location: ["generalized bilateral", "localized single breast"],
      associated: ["breast enlargement", "heaviness"]
    }
  },
  {
    id: "female_breast_tenderness",
    label: "Breast Tenderness",
    dimensions: {
      timing: ["premenstrual phase", "early pregnancy", "breastfeeding / engorgement"]
    }
  },
  {
    id: "female_nipple_discharge",
    label: "Nipple Discharge",
    dimensions: {
      character: ["bloody / serosanguinous", "clear / watery", "green / purulent"],
      occurrence: ["spontaneous", "only on expression"],
      duct: ["single duct", "multiple ducts"]
    },
    redFlags: [
      "Spontaneous bloody or clear discharge from a single duct (Intraductal papilloma / Carcinoma risk)"
    ]
  },
  {
    id: "female_nipple_inversion",
    label: "Nipple Inversion / Retraction",
    dimensions: {
      onset: ["new onset acquired nipple retraction (Breast carcinoma concern)", "congenital longstanding inversion"],
      side: ["unilateral", "bilateral"]
    },
    redFlags: [
      "New onset acquired unilateral nipple inversion or skin tethering (High suspicion for underlying invasive breast carcinoma)"
    ],
    requiredExams: [
      "Diagnostic Mammography and Breast Ultrasound",
      "Core needle biopsy if mass detected"
    ]
  },
  {
    id: "female_infertility",
    label: "Infertility",
    dimensions: {
      duration: ["unable to conceive after 12 months (age < 35)", "unable to conceive after 6 months (age >= 35)"],
      associated: ["irregular cycles", "pelvic pain history"]
    }
  },
  {
    id: "female_hirsutism",
    label: "Hirsutism (Excess Hair Growth)",
    dimensions: {
      location: ["face / upper lip / chin", "chest / abdomen", "back"],
      onset: ["gradual progressive (PCOS)", "rapid onset (androgen-secreting tumor alert)"],
      associated: ["acne", "hair thinning", "irregular menses"]
    },
    redFlags: [
      "Rapidly progressive hirsutism with virilization (clitoromegaly, voice deepening)"
    ]
  },
  {
    id: "female_postcoital_bleeding",
    label: "Postcoital Bleeding",
    dimensions: {
      character: ["spotting / light bleeding immediately after intercourse", "heavy bleeding post-coitus"],
      associated: ["cervical motion tenderness", "vaginal discharge"]
    },
    redFlags: [
      "Persistent postcoital bleeding (Cervical dysplasia or cervical cancer alert - requires speculum exam / Pap smear)"
    ]
  },
  {
    id: "female_reduced_libido",
    label: "Reduced Libido",
    dimensions: {
      character: ["decreased sexual desire", "loss of sexual responsiveness"],
      associated: ["fatigue", "menopause transition", "pain during intercourse"]
    }
  },
  {
    id: "female_hot_flashes",
    label: "Hot Flashes",
    dimensions: {
      character: ["sudden warmth spreading over face/chest", "profuse sweating", "chills following flash"],
      timing: ["daytime", "night sweats"],
      frequency: ["occasional", "multiple times per hour"]
    }
  },
  {
    id: "female_galactorrhea",
    label: "Galactorrhea",
    dimensions: {
      character: ["milky nipple discharge unassociated with childbirth/lactation"],
      side: ["bilateral", "unilateral"],
      associated: ["amenorrhea", "headaches", "visual field changes"]
    },
    redFlags: [
      "Galactorrhea + amenorrhea + headaches (Hyperprolactinemia / Pituitary prolactinoma alert)"
    ]
  }
];

export const ENDOCRINE_MODELS: SymptomModel[] = [
  // TEMPERATURE REGULATION
  {
    id: "endo_heat_intolerance",
    label: "Heat Intolerance",
    dimensions: {
      severity: ["mild discomfort", "severe inability to tolerate warm environments"],
      onset: ["gradual onset", "acute worsening"],
      associated: ["excessive sweating", "palpitations", "fine tremor", "frequent bowel movements", "unintentional weight loss"]
    },
    redFlags: [
      "Thyroid storm emergency (high fever, marked tachycardia, delirium, heat intolerance)"
    ],
    requiredExams: [
      "Serum TSH, Free T4, Free T3"
    ]
  },
  {
    id: "endo_cold_intolerance",
    label: "Cold Intolerance",
    dimensions: {
      severity: ["feeling colder than others", "constant shivering / inability to warm up"],
      onset: ["gradual progressive"],
      associated: ["dry skin", "constipation", "sluggishness", "periorbital puffiness"]
    },
    requiredExams: [
      "Serum TSH, Free T4"
    ]
  },
  {
    id: "endo_excessive_sweating",
    label: "Excessive Sweating (Hyperhidrosis)",
    dimensions: {
      distribution: ["palms, soles, and axillae (primary focal hyperhidrosis)", "generalized body sweating (secondary hyperhidrosis)"],
      timing: ["diurnal / awake only", "nocturnal (night sweats)", "paroxysmal sudden drenching sweat attacks"]
    },
    redFlags: [
      "Sweating triad with severe paroxysmal headache, palpitations, and hypertension (Pheochromocytoma alert)"
    ],
    requiredExams: [
      "Plasma free metanephrines or 24-hour urine fractionated metanephrines",
      "Serum TSH"
    ]
  },
  {
    id: "endo_reduced_sweating",
    label: "Reduced Sweating (Hypohidrosis / Anhidrosis)",
    dimensions: {
      distribution: ["generalized inability to sweat", "focal segmental anhidrosis"],
      triggers: ["heat exposure / physical exertion"],
      complications: ["flushing, dizziness, and risk of heat stroke"]
    }
  },

  // FLUID, ELECTROLYTE & GLUCOSE METABOLISM
  {
    id: "endo_excessive_thirst",
    label: "Excessive Thirst (Polydipsia)",
    dimensions: {
      character: ["unquenchable thirst", "intense craving for ice-cold water (Diabetes Insipidus alert)"],
      onset: ["acute sudden onset", "gradual progressive"]
    },
    redFlags: [
      "Polydipsia with polyuria, confusion, and abdominal pain (Diabetic Ketoacidosis / HHS emergency)"
    ]
  },
  {
    id: "endo_excessive_urination",
    label: "Excessive Urination (Polyuria)",
    dimensions: {
      character: ["large daily urine output volume (> 3 L/day)", "frequent nocturia disrupting sleep"],
      associated: ["polydipsia", "unintentional weight loss", "fatigue"]
    },
    redFlags: [
      "Polyuria with Kussmaul deep respiration and fruity breath odor (DKA alert)"
    ],
    requiredExams: [
      "Fasting plasma glucose and HbA1c",
      "Urinalysis, urine glucose, and urine ketones",
      "Serum and urine osmolality, water deprivation test if Diabetes Insipidus suspected"
    ]
  },
  {
    id: "endo_increased_appetite",
    label: "Increased Appetite (Polyphagia)",
    dimensions: {
      weight_trend: ["polyphagia with weight loss (Hyperthyroidism / Type 1 Diabetes alert)", "polyphagia with weight gain"],
      timing: ["constant hunger", "postprandial hypoglycemia episodes"]
    }
  },
  {
    id: "endo_salt_craving",
    label: "Salt Craving",
    dimensions: {
      character: ["intense urge to consume salty foods / adding excessive table salt"],
      associated: ["skin hyperpigmentation in palmar creases and oral mucosa", "postural dizziness / hypotension"]
    },
    redFlags: [
      "Salt craving with hyperpigmentation, severe hypotension, and abdominal pain (Primary Adrenal Insufficiency / Addisonian Crisis alert)"
    ],
    requiredExams: [
      "Serum electrolytes (hyponatremia + hyperkalemia)",
      "Morning 8 AM serum cortisol and plasma ACTH",
      "ACTH stimulation test"
    ]
  },

  // GROWTH, ANATOMIC & PHYSICAL CHANGES
  {
    id: "endo_growth_abnormalities",
    label: "Growth Abnormalities",
    dimensions: {
      pattern: ["growth velocity failure / short stature (< 3rd percentile)", "accelerated linear growth / gigantism"],
      age_group: ["pediatric", "adolescent"]
    },
    requiredExams: [
      "Serum IGF-1, bone age radiograph (left hand and wrist)",
      "Growth hormone stimulation testing"
    ]
  },
  {
    id: "endo_increased_shoe_size",
    label: "Increased Shoe Size",
    dimensions: {
      character: ["requiring wider or larger shoes in adult years due to soft tissue / bone enlargement"],
      cause: ["excess growth hormone secretion / acromegaly"]
    }
  },
  {
    id: "endo_increase_in_ring_size",
    label: "Increase in Ring Size",
    dimensions: {
      character: ["finger enlargement causing rings to become tight or unremovable"],
      cause: ["acromegaly / growth hormone hypersecretion"]
    }
  },
  {
    id: "endo_facial_feature_enlargement",
    label: "Facial Feature Enlargement",
    dimensions: {
      features: ["prominent brow ridge / supraorbital bossing", "enlarged nose and lips", "macroglossia (enlarged tongue)", "increased interdental spacing"],
      onset: ["insidious over years"]
    },
    redFlags: [
      "Acromegalic facial changes with bitemporal hemianopsia visual field loss (Pituitary macroadenoma compression emergency)"
    ],
    requiredExams: [
      "Serum IGF-1 level",
      "Oral glucose tolerance test (OGTT) for GH suppression",
      "Dedicated pituitary MRI with contrast"
    ]
  },
  {
    id: "endo_hirsutism",
    label: "Hirsutism (Excess Hair Growth)",
    dimensions: {
      location: ["chin, upper lip, chest, abdomen, back (male-pattern distribution in females)"],
      onset: ["gradual pubertal onset (PCOS)", "rapidly progressive (adrenocortical or ovarian virilizing tumor alert)"]
    },
    redFlags: [
      "Rapidly progressive hirsutism with clitoromegaly, voice deepening, or abdominal mass (Virilizing neoplasm alert)"
    ],
    requiredExams: [
      "Total and free testosterone, DHEAS, 17-hydroxyprogesterone",
      "Pelvic and adrenal imaging"
    ]
  },

  // HORMONAL & REPRODUCTIVE / ENDOCRINE
  {
    id: "endo_decreased_libido",
    label: "Decreased Libido",
    dimensions: {
      associated: ["fatigue", "erectile dysfunction", "amenorrhea / oligomenorrhea", "galactorrhea"],
      suspicion: ["hypogonadism", "hyperprolactinemia", "thyroid dysfunction"]
    }
  },
  {
    id: "endo_erectile_dysfunction",
    label: "Erectile Dysfunction (Male)",
    dimensions: {
      onset: ["gradual onset (endocrine / vascular / neuropathy)", "sudden onset (psychogenic)"],
      nocturnal_erections: ["absent nocturnal / morning erections (organic cause)", "preserved morning erections (psychogenic cause)"]
    },
    requiredExams: [
      "Morning total testosterone, prolactin, LH, fasting glucose, lipid panel"
    ]
  },
  {
    id: "endo_hot_flashes",
    label: "Hot Flashes",
    dimensions: {
      character: ["sudden intense sensation of heat, facial flushing, drenching sweat, follow-up chills"],
      timing: ["nocturnal (night sweats)", "perimenopausal / postmenopausal", "post-surgical / anti-androgen therapy"]
    }
  },
  {
    id: "endo_galactorrhea",
    label: "Galactorrhea (Milk Discharge)",
    dimensions: {
      character: ["inappropriate milky breast secretions not associated with childbirth/lactation"],
      lateral: ["bilateral", "unilateral"],
      population: ["female", "male"]
    },
    redFlags: [
      "Galactorrhea accompanied by severe headaches or visual field defects (Pituitary prolactinoma alert)"
    ],
    requiredExams: [
      "Serum Prolactin, serum TSH, pregnancy test (beta-hCG)",
      "Pituitary MRI if prolactin significantly elevated"
    ]
  },
  {
    id: "endo_voice_deepening",
    label: "Voice Deepening",
    dimensions: {
      character: ["coarsening or lowering of vocal pitch"],
      associated: ["hirsutism", "clitoromegaly", "acromegaly features"]
    }
  },
  {
    id: "endo_voice_change",
    label: "Voice Change",
    dimensions: {
      character: ["hoarseness", "husky low voice", "vocal fatigue"],
      causes: ["thyroid enlargement / goiter compression on recurrent laryngeal nerve", "hypothyroidism myxedema of vocal cords"]
    }
  },
  {
    id: "endo_gynecomastia",
    label: "Gynecomastia (Male)",
    dimensions: {
      character: ["palpable glandular breast tissue proliferation in males"],
      tenderness: ["painful / tender acute breast bud", "non-tender chronic enlargement"],
      symmetry: ["bilateral", "unilateral"]
    },
    requiredExams: [
      "Serum testosterone, LH, FSH, Estradiol, beta-hCG, liver function tests"
    ]
  }
];

export const HEMATOLOGIC_MODELS: SymptomModel[] = [
  // BLEEDING & BRUISING
  {
    id: "hema_easy_bruising",
    label: "Easy Bruising",
    dimensions: {
      context: ["spontaneous bruising", "bruising after minimal trauma", "disproportionate to trauma"],
      location: ["arms and legs", "trunk / chest / back", "unusual locations (face, buttocks)"],
      size: ["small ecchymoses", "large extensive purpura / hematomas"]
    },
    redFlags: [
      "Spontaneous bruising on trunk, back, or face without preceding trauma",
      "Large, deep, painful muscle hematomas (hemophilia or factor inhibitor concern)",
      "Bruising associated with acute bleeding from multiple mucosal sites"
    ],
    requiredExams: [
      "Complete Blood Count (CBC) with platelet count and peripheral smear",
      "Coagulation panel (PT/INR, aPTT, fibrinogen)"
    ]
  },
  {
    id: "hema_easy_bleeding",
    label: "Easy Bleeding",
    dimensions: {
      location: ["gums when brushing", "mucosal surface", "superficial cuts"],
      frequency: ["frequent daily", "intermittent"],
      severity: ["mild ooze", "moderate persistent bleeding"]
    }
  },
  {
    id: "hema_prolonged_bleeding",
    label: "Prolonged Bleeding",
    dimensions: {
      triggers: ["after minor skin cuts", "following dental extraction / surgery", "epistaxis lasting > 10 minutes"],
      severity: ["requires prolonged direct pressure (> 15 mins)", "requires clinical packing / cautery / transfusion"]
    },
    redFlags: [
      "Uncontrolled mucosal bleeding requiring emergency department packing or blood product administration",
      "Acute onset severe mucosal bleeding diathesis in an adult (Acquired hemophilia or severe thrombocytopenia)"
    ],
    requiredExams: [
      "CBC, PT/INR, aPTT, Von Willebrand factor antigen and ristoceitin cofactor activity"
    ]
  },
  {
    id: "hema_petechiae",
    label: "Petechiae",
    dimensions: {
      character: ["non-blanching pinpoint red / purple spots (< 3mm)"],
      distribution: ["dependent lower extremities (ankles/feet)", "widespread generalized body distribution", "oral mucosa"]
    },
    redFlags: [
      "Sudden widespread petechial rash with fever and neck stiffness (Meningococcemia emergency)",
      "Acute generalized petechiae with severe thrombocytopenia (ITP, TTP, DIC, acute leukemia alert)"
    ],
    requiredExams: [
      "STAT CBC with platelet count",
      "Peripheral blood smear examination for schistocytes and blasts"
    ]
  },
  {
    id: "hema_purpura",
    label: "Purpura",
    dimensions: {
      type: ["dry purpura (purple non-blanching skin macules 3-10mm)", "palpable purpura (raised palpable lesions - vasculitis alert)", "wet purpura (blood blisters in mouth)"],
      distribution: ["lower limbs / buttocks (Henoch-Schönlein / IgAV pattern)", "diffuse body"]
    },
    redFlags: [
      "Palpable purpura in a septic or deteriorating patient (Disseminated Intravascular Coagulation / Vasculitis emergency)",
      "Wet purpura (oral blood blisters) indicating high imminent risk of intracranial or visceral hemorrhage"
    ],
    requiredExams: [
      "STAT platelet count and coagulation screen",
      "Urinalysis (for hematuria in IgA vasculitis)",
      "Skin biopsy if cutaneous vasculitis suspected"
    ]
  },
  {
    id: "hema_recurrent_nosebleeds",
    label: "Recurrent Nosebleeds (Epistaxis)",
    dimensions: {
      frequency: ["multiple times per week", "daily"],
      duration: ["< 10 minutes", "> 10 minutes requiring pressure"],
      laterality: ["unilateral", "bilateral"]
    }
  },
  {
    id: "hema_bleeding_gums",
    label: "Bleeding Gums",
    dimensions: {
      triggers: ["spontaneous bleeding without contact", "during routine toothbrushing", "eating hard food"],
      associated: ["swollen spongy gums (Scurvy / Vitamin C deficiency)", "easy bruising", "fever"]
    }
  },
  {
    id: "hema_blood_blisters_in_mouth",
    label: "Blood Blisters in the Mouth (Wet Purpura)",
    dimensions: {
      location: ["buccal mucosa", "tongue", "soft palate"],
      severity: ["critical marker of severe thrombocytopenia (< 10,000/uL)"]
    },
    redFlags: [
      "Wet purpura in mouth indicates critical bleeding risk - urgent platelet transfusion evaluation"
    ],
    requiredExams: [
      "Emergency STAT CBC and platelet count"
    ]
  },

  // LYMPHATICS
  {
    id: "hema_swollen_lymph_nodes",
    label: "Swollen Lymph Nodes",
    dimensions: {
      location: ["cervical (neck)", "supraclavicular (above collarbone)", "axillary (armpit)", "inguinal (groin)", "generalized (> 2 non-contiguous regions)"],
      character: ["painless / non-tender", "firm / rubbery (lymphoma alert)", "hard / rock-like (metastatic alert)", "fixed / matted to underlying tissue"],
      duration: ["acute (< 2 weeks)", "persistent (> 4 weeks)", "progressively enlarging"]
    },
    redFlags: [
      "Supraclavicular lymphadenopathy (Virchow node - highly suspicious for intra-abdominal / thoracic malignancy)",
      "Painless, hard, fixed, or rubbery matted lymph nodes > 2 cm persisting > 4 weeks",
      "Generalized lymphadenopathy with B-symptoms (fever, drenching night sweats, weight loss > 10%)"
    ],
    requiredExams: [
      "Comprehensive lymph node basin palpation and spleen size assessment",
      "Excisional lymph node biopsy (gold standard)",
      "CBC with differential, LDH, peripheral smear"
    ]
  },
  {
    id: "hema_painful_lymph_nodes",
    label: "Painful Lymph Nodes",
    dimensions: {
      location: ["cervical / submandibular", "axillary", "inguinal"],
      character: ["tender to touch", "warm and erythematous overlying skin", "mobile"],
      associated: ["fever", "localized skin / throat / dental infection"]
    },
    requiredExams: [
      "Targeted physical exam for local source of infection",
      "CBC with differential"
    ]
  }
];

export const PSYCHIATRIC_MODELS: SymptomModel[] = [
  // 1. MOOD SYMPTOMS
  {
    id: "psych_low_mood",
    label: "Low Mood",
    dimensions: {
      character: ["feeling down, sad, empty, or tearful most of the day"],
      chronicity: ["persistent for > 2 weeks (major depressive episode alert)", "intermittent", "diurnal variation (worse in morning)"],
      severity: ["mild functional impact", "severe inability to carry out daily tasks"]
    },
    redFlags: [
      "Low mood accompanied by active suicidal intent or plan (Psychiatric Emergency)",
      "Profound depressive stupor or refusal to consume food and fluids"
    ],
    requiredExams: [
      "Patient Health Questionnaire (PHQ-9)",
      "Columbia-Suicide Severity Rating Scale (C-SSRS)",
      "Rule out hypothyroidism (TSH) and B12 deficiency"
    ]
  },
  {
    id: "psych_anhedonia",
    label: "Anhedonia (Loss of Interest or Pleasure)",
    dimensions: {
      scope: ["loss of interest in previously enjoyed hobbies", "social withdrawal", "loss of sexual desire / pleasure"],
      duration: ["pervasive for > 2 weeks (core DSM criterion for Major Depression)"]
    }
  },
  {
    id: "psych_elevated_mood",
    label: "Elevated Mood",
    dimensions: {
      character: ["euphoric / abnormally elevated mood", "expansive or excessively cheerful", "irritable mood with grandiosity"],
      duration: ["persistent for > 4 days (hypomania)", "persistent for >= 1 week or requiring hospitalization (mania)"],
      associated: ["decreased need for sleep", "racing thoughts", "pressured speech"]
    },
    redFlags: [
      "Severe manic episode with psychotic features (grandiose delusions, hallucinations)",
      "Reckless behaviors placing self or public at severe physical/financial risk"
    ],
    requiredExams: [
      "Mood Disorder Questionnaire (MDQ)",
      "Urine drug screen to exclude substance-induced mania"
    ]
  },
  {
    id: "psych_mood_swings",
    label: "Mood Swings",
    dimensions: {
      pattern: ["rapid shifts within hours/days (affective lability)", "cyclical shifts over weeks/months"],
      triggers: ["interpersonal stressors / rejection sensitivity", "spontaneous / unprovoked"]
    }
  },
  {
    id: "psych_irritability",
    label: "Irritability",
    dimensions: {
      severity: ["low frustration tolerance", "frequent verbal outbursts / snap anger"],
      context: ["bipolar episode", "major depression", "generalized anxiety", "substance withdrawal"]
    }
  },
  {
    id: "psych_feelings_of_hopelessness",
    label: "Feelings of Hopelessness",
    dimensions: {
      character: ["perceiving future as bleak / impossible to improve"],
      clinical_significance: ["strong correlation with suicidal risk"]
    },
    redFlags: [
      "Pervasive hopelessness with explicit expressions of 'giving up' (Immediate suicide risk assessment required)"
    ]
  },
  {
    id: "psych_feelings_of_worthlessness",
    label: "Feelings of Worthlessness",
    dimensions: {
      character: ["perceiving self as a burden to family / society", "pervasive self-contempt"]
    }
  },
  {
    id: "psych_guilt",
    label: "Guilt",
    dimensions: {
      character: ["excessive or inappropriate self-blame over past events", "delusional guilt (psychotic depression alert)"]
    }
  },
  {
    id: "psych_emotional_numbness",
    label: "Emotional Numbness",
    dimensions: {
      character: ["feeling detached from emotions / unable to cry or feel affection"],
      causes: ["severe trauma / PTSD dissociative state", "severe depression", "antidepressant blunting"]
    }
  },

  // 2. ANXIETY & OBSESSIVE SYMPTOMS
  {
    id: "psych_anxiety",
    label: "Anxiety",
    dimensions: {
      character: ["persistent apprehension, nervousness, or internal tension"],
      somatic: ["palpitations", "sweating", "trembling", "shortness of breath", "gastrointestinal distress"]
    },
    requiredExams: [
      "Generalized Anxiety Disorder 7-item scale (GAD-7)",
      "Rule out hyperthyroidism, cardiac dysrhythmia, and stimulant use"
    ]
  },
  {
    id: "psych_excessive_worry",
    label: "Excessive Worry",
    dimensions: {
      focus: ["health", "finances", "family safety", "work performance", "generalized / multiple domains"],
      controllability: ["difficult or impossible to control worry thoughts"]
    }
  },
  {
    id: "psych_panic_attacks",
    label: "Panic Attacks",
    dimensions: {
      onset: ["abrupt surge of intense fear reaching a peak within minutes"],
      somatic: ["chest pain / tightness", "palpitations", "dizziness / lightheadedness", "paresthesias", "fear of losing control / dying"],
      frequency: ["recurrent unexpected panic attacks (panic disorder)"]
    },
    redFlags: [
      "First-time panic symptoms in patients > 40 with cardiac risk factors (Rule out Acute Coronary Syndrome or PE)"
    ],
    requiredExams: [
      "12-lead ECG to rule out cardiac etiology",
      "Pulse oximetry and basic metabolic panel"
    ]
  },
  {
    id: "psych_obsessive_thoughts",
    label: "Obsessive Thoughts",
    dimensions: {
      nature: ["recurrent intrusive unwanted thoughts, urges, or images causing marked anxiety"],
      themes: ["contamination", "harm / safety checking", "symmetry / order", "taboo thoughts"]
    }
  },
  {
    id: "psych_compulsive_behaviors",
    label: "Compulsive Behaviors",
    dimensions: {
      nature: ["repetitive behaviors (handwashing, checking, ordering) or mental acts performed to neutralize obsession"],
      impact: ["time-consuming (> 1 hr/day) causing severe occupational/social impairment"]
    },
    requiredExams: [
      "Yale-Brown Obsessive Compulsive Scale (Y-BOCS)"
    ]
  },

  // 3. SLEEP & PSYCHOMOTOR SYMPTOMS
  {
    id: "psych_insomnia",
    label: "Insomnia",
    dimensions: {
      pattern: ["sleep onset insomnia", "middle insomnia (frequent awakenings)", "terminal / early morning awakening"],
      duration: ["acute (< 3 months)", "chronic (>= 3 nights/week for > 3 months)"]
    }
  },
  {
    id: "psych_difficulty_falling_asleep",
    label: "Difficulty Falling Asleep",
    dimensions: {
      latency: ["taking > 30-60 minutes to fall asleep"],
      associated: ["racing thoughts", "performance anxiety about sleep"]
    }
  },
  {
    id: "psych_frequent_night_awakenings",
    label: "Frequent Night Awakenings",
    dimensions: {
      frequency: ["waking 3+ times per night"],
      associated: ["difficulty returning to sleep", "nocturia", "snoring / apneas"]
    }
  },
  {
    id: "psych_hypersomnia",
    label: "Excessive Sleepiness (Hypersomnia)",
    dimensions: {
      character: ["excessive daytime sleepiness despite >= 7 hours sleep", "prolonged nocturnal sleep (> 9-10 hours)"],
      causes: ["atypical depression", "narcolepsy", "obstructive sleep apnea", "hypothyroidism"]
    }
  },
  {
    id: "psych_nightmares",
    label: "Nightmares",
    dimensions: {
      character: ["frightening, vivid dreams causing abrupt awakening with clear recall"],
      association: ["Post-Traumatic Stress Disorder (PTSD trauma-related nightmares)", "medication side effect"]
    }
  },
  {
    id: "psych_restlessness_agitation",
    label: "Restlessness (Psychomotor Agitation)",
    dimensions: {
      character: ["pacing, hand-wringing, inability to sit still, pulling at clothes"],
      context: ["severe anxiety", "agitated depression", "akathisia (antipsychotic side effect)", "substance withdrawal"]
    }
  },
  {
    id: "psych_psychomotor_slowing",
    label: "Psychomotor Slowing (Retardation)",
    dimensions: {
      character: ["visible slowing of physical movements, speech, and thought processing"],
      context: ["severe melancholic depression", "parkinsonian state", "catatonia alert"]
    },
    redFlags: [
      "Severe retardation progressing to mutism and immobility (Catatonia emergency)"
    ]
  },

  // 4. PSYCHOTIC & THOUGHT DISORDERS
  {
    id: "psych_hallucinations",
    label: "Hallucinations",
    dimensions: {
      modality: ["auditory (hearing voices / commentary)", "visual (seeing figures/lights)", "tactile / somatic", "olfactory / gustatory"],
      character: ["command hallucinations (voices ordering action)", "friendly vs distressing"]
    },
    redFlags: [
      "Command auditory hallucinations directing self-harm or violence towards others (Psychiatric Emergency)",
      "Visual or tactile hallucinations with sudden confusion (Rule out delirium, encephalitis, or substance withdrawal)"
    ],
    requiredExams: [
      "Urine toxicology screen",
      "Neurological examination and brain MRI if first-episode psychosis"
    ]
  },
  {
    id: "psych_delusions",
    label: "Delusions",
    dimensions: {
      type: ["persecutory / paranoid", "grandiose", "somatic", "nihilistic (Cotard syndrome)", "control / passivity"],
      bizarreness: ["bizarre (implausible)", "non-bizarre (plausible but false)"]
    }
  },
  {
    id: "psych_paranoia",
    label: "Paranoia",
    dimensions: {
      character: ["intense irrational distrust or suspicion that others intend harm"],
      behavior: ["barricading home", "avoiding food/medications due to fear of poison", "hypervigilance"]
    },
    redFlags: [
      "Severe paranoia leading to weaponization or violent defensive action (High risk evaluation)"
    ]
  },
  {
    id: "psych_disorganized_thinking",
    label: "Disorganized Thinking",
    dimensions: {
      manifestation: ["tangentiality", "loose associations / derailment", "word salad / incoherence", "thought blocking"]
    }
  },

  // 5. BEHAVIORAL & COGNITIVE / FUNCTIONAL
  {
    id: "psych_behavioral_changes",
    label: "Behavioral Changes",
    dimensions: {
      character: ["unexplained changes in personality, hygiene, risk-taking, or social conduct"],
      onset: ["acute onset", "gradual progressive over months"]
    },
    requiredExams: [
      "Collateral history from family / care partner",
      "Evaluate for organic brain pathology (frontal lobe tumor, frontotemporal dementia)"
    ]
  },
  {
    id: "psych_impulsivity",
    label: "Impulsivity",
    dimensions: {
      manifestation: ["reckless driving", "binge eating", "gambling", "impulsive spending", "unprotected casual sex"]
    }
  },
  {
    id: "psych_aggressive_behavior",
    label: "Aggressive Behavior",
    dimensions: {
      character: ["verbal aggression", "physical violence towards objects or people"],
      context: ["acute psychosis", "intoxication / withdrawal", "dementia agitation", "intermittent explosive disorder"]
    },
    redFlags: [
      "Imminent physical violence or threat with intent and capability (Emergency security / psychiatric intervention)"
    ]
  },
  {
    id: "psych_hyperactivity",
    label: "Hyperactivity",
    dimensions: {
      character: ["excessive motor activity, inability to remain seated, talkativeness"],
      population: ["pediatric / ADHD", "adult mania / hypomania"]
    }
  },
  {
    id: "psych_social_withdrawal",
    label: "Social Withdrawal",
    dimensions: {
      character: ["avoiding friends, family, and public settings", "self-isolation"],
      causes: ["depression", "negative symptoms of schizophrenia", "severe social anxiety"]
    }
  },
  {
    id: "psych_loss_of_motivation",
    label: "Loss of Motivation (Avolition)",
    dimensions: {
      character: ["inability to initiate and persist in goal-directed activities (hygiene, work, chores)"]
    }
  },
  {
    id: "psych_memory_problems",
    label: "Memory Problems (Psychiatric / Pseudodementia)",
    dimensions: {
      character: ["perceived memory impairment associated with severe depression or anxiety ('I can't remember anything')"],
      distinction: ["gives 'I don't know' answers on testing (pseudodementia) vs near-miss answers in organic dementia"]
    }
  },
  {
    id: "psych_difficulty_concentrating",
    label: "Difficulty Concentrating (Psychiatric)",
    dimensions: {
      character: ["inability to maintain focus when reading, watching TV, or working due to depressive thoughts or anxiety"]
    }
  },

  // 6. RISK & SAFETY SYMPTOMS
  {
    id: "psych_suicidal_thoughts",
    label: "Suicidal Thoughts",
    dimensions: {
      type: ["passive ideation (wishing to go to sleep and not wake up)", "active ideation with specific plan and method"],
      intent: ["active intent to act on thoughts", "no intent / fear of dying"],
      preparatory: ["writing goodbye notes", "giving away possessions", "acquiring lethal means"]
    },
    redFlags: [
      "Active suicidal ideation with plan, intent, and immediate access to lethal means (Immediate Emergency Intervention Required)",
      "Sudden calm affect following severe depression (May indicate decision finalized)"
    ],
    requiredExams: [
      "Columbia-Suicide Severity Rating Scale (C-SSRS)",
      "Immediate lethal means safety counseling and psychiatric emergency evaluation"
    ]
  },
  {
    id: "psych_homicidal_thoughts",
    label: "Homicidal Thoughts",
    dimensions: {
      intent: ["passive intrusive thoughts causing distress", "active intent towards a specific targeted individual"],
      plan: ["formulated plan and access to weapons"]
    },
    redFlags: [
      "Active homicidal plan targeting a specific person with capability to carry out plan (Duty to Warn / Emergency Intervention)"
    ],
    requiredExams: [
      "Immediate psychiatric crisis assessment and safety isolation"
    ]
  },
  {
    id: "psych_self_harm_behavior",
    label: "Self-Harm Behavior",
    dimensions: {
      type: ["non-suicidal self-injury (NSSI: cutting, burning, scratching)", "self-hitting"],
      function: ["affect regulation / relief of intense emotional pain", "self-punishment"]
    },
    requiredExams: [
      "Physical examination of skin for active wounds requiring medical treatment or tetanus booster",
      "Assessment for underlying Borderline Personality Disorder or severe trauma"
    ]
  }
];

export const IMMUNOLOGIC_MODELS: SymptomModel[] = [
  // 1. ALLERGIC CUTANEOUS & MUCOSAL SYMPTOMS
  {
    id: "immuno_generalized_itching",
    label: "Generalized Itching",
    dimensions: {
      distribution: ["diffuse body-wide itching without primary rash", "generalized pruritus with hives"],
      triggers: ["after exposure to allergen", "hot shower / bath", "medication exposure", "spontaneous"],
      associated: ["hives", "skin flushing", "dry skin"]
    },
    redFlags: [
      "Generalized itching accompanied by difficulty breathing, lip/tongue swelling, or dizziness (Anaphylaxis alert)"
    ]
  },
  {
    id: "immuno_hives_urticaria",
    label: "Hives (Urticaria)",
    dimensions: {
      appearance: ["raised circumscribed erythematous wheals", "intensely pruritic hives"],
      blanching: ["blanching with pressure"],
      duration: ["individual wheals resolve within 24 hours leaving no scar", "chronic recurrent hives (> 6 weeks)"],
      triggers: ["food ingestion", "medication", "insect sting", "cold / heat / pressure", "stress", "viral infection"]
    },
    redFlags: [
      "Rapidly spreading hives with throat tightness, dyspnea, or hypotension (Anaphylaxis emergency)",
      "Painful non-blanching wheals lasting > 24 hours leaving hyperpigmentation (Urticarial Vasculitis alert)"
    ],
    requiredExams: [
      "Clinical skin evaluation",
      "Complete Blood Count",
      "Total IgE and allergen-specific IgE testing if recurrent"
    ]
  },
  {
    id: "immuno_angioedema",
    label: "Angioedema",
    dimensions: {
      depth: ["deep dermal, subcutaneous, or submucosal swelling"],
      location: ["face, lips, tongue, periorbital, genitals, extremities"],
      character: ["painful tightness / burning rather than intense itching"],
      triggers: ["ACE inhibitors", "NSAIDs", "C1 esterase inhibitor deficiency (Hereditary Angioedema)", "food / drug allergen"]
    },
    redFlags: [
      "Angioedema involving larynx / airway (stridor, voice changes, asphyxiation threat - IMMEDIATE AIRWAY EMERGENCY)",
      "Abdominal angioedema causing severe unexplained cramping abdominal pain"
    ],
    requiredExams: [
      "STAT Airway assessment",
      "Serum C4 level, C1 esterase inhibitor quantitative and functional assay (if non-pruritic recurrent angioedema without hives)"
    ]
  },
  {
    id: "immuno_facial_swelling",
    label: "Facial Swelling",
    dimensions: {
      location: ["periorbital, cheeks, diffuse facial edema"],
      onset: ["acute allergic onset", "gradual progressive"],
      symmetry: ["bilateral", "unilateral"]
    },
    redFlags: [
      "Facial swelling spreading to lips, tongue, or throat causing stridor or dyspnea"
    ]
  },
  {
    id: "immuno_lip_swelling",
    label: "Lip Swelling",
    dimensions: {
      location: ["upper lip", "lower lip", "both lips"],
      character: ["asymmetric or symmetric painless or painful swelling"],
      triggers: ["food ingestion", "drug exposure", "insect bite"]
    },
    redFlags: [
      "Lip swelling accompanied by feeling of throat fullness, hoarseness, or shortness of breath (Anaphylaxis alert)"
    ]
  },
  {
    id: "immuno_tongue_swelling",
    label: "Tongue Swelling",
    dimensions: {
      severity: ["mild glossal enlargement", "severe macroglossia protruding from mouth / occluding airway"],
      triggers: ["ACE inhibitor use", "food allergy (peanuts, tree nuts, shellfish)", "medication allergy"]
    },
    redFlags: [
      "Tongue swelling compromising oral airway, causing inability to swallow saliva / drooling, or dyspnea (CRITICAL AIRWAY EMERGENCY)"
    ],
    requiredExams: [
      "Immediate direct/indirect airway examination and emergency stabilization preparedness"
    ]
  },
  {
    id: "immuno_throat_swelling",
    label: "Throat Swelling",
    dimensions: {
      character: ["sensation of throat tightening, lump in throat (globus), voice alteration, stridor"],
      triggers: ["food / drug allergen ingestion", "insect sting"]
    },
    redFlags: [
      "Rapidly progressive throat tightness with inspiratory stridor or inability to speak (IMMEDIATE EPINEPHRINE & AIRWAY MANAGEMENT REQUIRED)"
    ],
    requiredExams: [
      "Urgent ENT / Airway evaluation",
      "STAT Epinephrine administration if anaphylactic"
    ]
  },
  {
    id: "immuno_mouth_swelling",
    label: "Mouth Swelling",
    dimensions: {
      location: ["oral mucosa, soft palate, uvula, buccal mucosa"],
      character: ["edema, tingling, tightness"],
      triggers: ["Oral Allergy Syndrome (pollen-food syndrome)", "medications"]
    },
    redFlags: [
      "Swelling extending to uvula or soft palate causing airway compromise"
    ]
  },

  // 2. NASAL & OCULAR ALLERGIC SYMPTOMS
  {
    id: "immuno_itchy_eyes",
    label: "Itchy Eyes",
    dimensions: {
      character: ["bilateral intense ocular itching, rubbing urge"],
      associated: ["watery discharge", "palpebral conjunctival redness", "eyelid swelling"],
      triggers: ["seasonal pollen", "animal dander", "dust mites"]
    }
  },
  {
    id: "immuno_sneezing",
    label: "Sneezing",
    dimensions: {
      pattern: ["paroxysmal bouts of sneezing (5-10 times in row)"],
      triggers: ["allergen exposure", "bright light (photic)", "cold air", "dust"]
    }
  },
  {
    id: "immuno_nasal_itching",
    label: "Nasal Itching",
    dimensions: {
      character: ["intense itching inside nose or soft palate"],
      associated: ["allergic salute (rubbing nose upwards)", "allergic crease"]
    }
  },
  {
    id: "immuno_runny_nose",
    label: "Runny Nose",
    dimensions: {
      character: ["clear, profuse watery rhinorrhea"],
      timing: ["perennial (year-round)", "seasonal"],
      associated: ["nasal itching", "sneezing"]
    }
  },
  {
    id: "immuno_nasal_congestion",
    label: "Nasal Congestion",
    dimensions: {
      character: ["bilateral or alternating nasal turbinate swelling and blockage"],
      impact: ["mouth breathing", "hyposmia", "sleep disruption"]
    }
  },

  // 3. SYSTEMIC ALLERGY, RESPIRATORY EXPOSURE & IMMUNODEFICIENCY
  {
    id: "immuno_recurrent_allergic_reactions",
    label: "Recurrent Allergic Reactions",
    dimensions: {
      frequency: ["frequent episodic urticaria / angioedema / rhinitis flares"],
      known_triggers: ["identified specific allergens", "idiopathic recurrent flares"],
      severity: ["mild cutaneous only", "recurrent multi-system episodes"]
    },
    redFlags: [
      "Recurrent unprovoked severe anaphylactic episodes requiring frequent epinephrine auto-injector use (Idiopathic Anaphylaxis or Mastocytosis concern)"
    ],
    requiredExams: [
      "Serum Tryptase level (baseline and post-episode)",
      "Comprehensive allergy skin prick testing or specific IgE panel"
    ]
  },
  {
    id: "immuno_difficulty_breathing_after_exposure",
    label: "Difficulty Breathing After Exposure",
    dimensions: {
      trigger_type: ["known allergen ingestion (peanuts, shellfish, dairy)", "insect sting", "medication", "inhalant exposure"],
      onset: ["within minutes after contact", "within 1-2 hours"],
      associated: ["wheezing", "stridor", "chest tightness", "hives", "vomiting"]
    },
    redFlags: [
      "Acute dyspnea or wheezing following allergen exposure (Anaphylactic Respiratory Distress Emergency - administer Epinephrine immediately)"
    ],
    requiredExams: [
      "STAT pulse oximetry, peak flow measurement, emergency epinephrine readiness"
    ]
  },
  {
    id: "immuno_recurrent_infections",
    label: "Recurrent Infections",
    dimensions: {
      sites: ["recurrent sinopulmonary infections (otitis, sinusitis, pneumonia)", "recurrent deep skin abscesses / thrush"],
      frequency: [">= 4 ear infections/yr", ">= 2 severe sinus infections/yr", ">= 2 pneumonias/yr"],
      organisms: ["encapsulated bacteria", "opportunistic fungal / viral pathogens"]
    },
    redFlags: [
      "Recurrent severe infections requiring IV antibiotics or hospitalizations (Primary Immunodeficiency / CVID alert)"
    ],
    requiredExams: [
      "Quantitative Immunoglobulins (IgG, IgA, IgM, IgE)",
      "Specific antibody responses (Tetanus, Pneumococcal vaccine titers)",
      "Complete Blood Count with differential and lymphocyte subset panel"
    ]
  },
  {
    id: "immuno_delayed_wound_healing",
    label: "Delayed Wound Healing",
    dimensions: {
      character: ["minor skin wounds or surgical incisions failing to heal or re-opening over weeks"],
      associated: ["recurrent skin infections", "easy bruising", "friable tissue"]
    }
  }
];

export const PEDIATRIC_MODELS: SymptomModel[] = [
  {
    id: "ped_poor_growth",
    label: "Poor Growth / Growth Failure",
    dimensions: {
      onset: ["infancy", "toddler", "preschool", "school age"],
      trajectory: ["crossing percentile lines downwards", "linear height velocity < 5th percentile", "flat growth curve"],
      associated: ["poor appetite", "developmental delay", "frequent infections"]
    },
    redFlags: [
      "Crossing two or more major percentile curves downwards",
      "Dysmorphic features or skeletal dysplasia signs",
      "Height velocity below expected genetic target range"
    ]
  },
  {
    id: "ped_poor_weight_gain",
    label: "Poor Weight Gain",
    dimensions: {
      pattern: ["slow steady gain below 3rd percentile", "acute weight loss", "weight plateau"],
      feeding: ["poor intake", "frequent regurgitation", "fatigue during feeding"],
      duration: ["< 2 weeks", "1-3 months", "> 3 months"]
    },
    redFlags: [
      "Weight for length < 3rd percentile",
      "Signs of overt malnutrition or muscle wasting",
      "Dehydration or lethargy"
    ]
  },
  {
    id: "ped_failure_to_thrive",
    label: "Failure to Thrive",
    dimensions: {
      category: ["organic (underlying illness)", "non-organic (environmental/feeding)", "mixed"],
      severity: ["mild (weight < 5th percentile)", "moderate", "severe (weight < 75% of median)"],
      associated: ["developmental delay", "recurrent illness", "abnormal stooling"]
    },
    redFlags: [
      "Severe acute malnutrition (SAM)",
      "Marked developmental regression or lethargy",
      "Suspected neglect or unsafe home environment"
    ]
  },
  {
    id: "ped_excessive_crying",
    label: "Excessive Crying",
    dimensions: {
      pattern: ["infantile colic pattern (3+ hrs/day, 3+ days/wk)", "paroxysmal evening crying", "constant all-day crying"],
      soothability: ["soothable with rocking/feeding", "difficult to soothe", "inconsolable"],
      associated: ["drawing legs up to abdomen", "flushed face", "clenched fists"]
    },
    redFlags: [
      "Inconsolable crying lasting > 2 hours continuously",
      "Bulging fontanelle, fever, or lethargy",
      "Signs of non-accidental trauma or corneal abrasion"
    ]
  },
  {
    id: "ped_persistent_irritability",
    label: "Persistent Irritability",
    dimensions: {
      onset: ["acute onset", "chronic/recurrent"],
      triggers: ["during/after feeds", "with movement", "spontaneous"],
      behavior: ["unusually fussy", "hypersensitive to light/touch", "weak whiny cry"]
    },
    redFlags: [
      "High-pitched cry or irritability alternating with lethargy",
      "Nuchal rigidity or bulging fontanelle",
      "Petechial or purpuric rash"
    ]
  },
  {
    id: "ped_poor_feeding",
    label: "Poor Feeding",
    dimensions: {
      onset: ["sudden refusal", "gradual decrease in volume"],
      character: ["weak suck", "tiring after 2-3 minutes", "gagging / choking"],
      associated: ["tachypnea while sucking", "sweating during feeds"]
    },
    redFlags: [
      "Complete refusal of feeds for > 8-12 hours in an infant",
      "Feeding fatigue with diaphoresis and tachypnea (congestive heart failure alert)",
      "Lethargy or floppiness"
    ]
  },
  {
    id: "ped_feeding_difficulty",
    label: "Difficulty Breastfeeding / Bottle Feeding",
    dimensions: {
      type: ["poor latch", "painful swallowing", "frequent coughing/spluttering", "excessive air swallowing"],
      anatomical: ["tongue-tie (ankyloglossia)", "cleft palate/lip", "micrognathia"],
      volume: ["taking < 50% expected volume", "prolonged feeds > 45 mins"]
    },
    redFlags: [
      "Repeated aspiration, coughing, or cyanosis during feeding",
      "Significant infant weight loss (> 10% of birth weight)",
      "Anuria or severe dehydration signs"
    ]
  },
  {
    id: "ped_developmental_delay",
    label: "Developmental Delay",
    dimensions: {
      domains: ["global (2+ domains)", "gross motor", "fine motor", "language", "personal-social"],
      severity: ["mild delay", "moderate delay", "severe delay"],
      age: ["infant (< 12 mo)", "toddler (1-3 yr)", "preschool (3-5 yr)"]
    },
    redFlags: [
      "Loss of previously acquired developmental milestones",
      "Significant hypotonia or hypertonia",
      "Microcephaly or macrocephaly with abnormal head growth velocity"
    ]
  },
  {
    id: "ped_speech_delay",
    label: "Speech Delay",
    dimensions: {
      expressive: ["no babbling by 12 mo", "no single words by 16-18 mo", "no 2-word phrases by 24 mo"],
      receptive: ["does not respond to name by 12 mo", "difficulty following simple commands"],
      associated: ["hearing concerns", "inattention", "lack of gestures / pointing"]
    },
    redFlags: [
      "Loss of speech or social engagement at any age",
      "Unresponsiveness to loud sounds (suspected sensorineural hearing loss)",
      "Lack of joint attention or non-verbal communication"
    ]
  },
  {
    id: "ped_motor_delay",
    label: "Motor Delay",
    dimensions: {
      type: ["gross motor (head control, sitting, crawling, walking)", "fine motor (pincer grasp, stacking blocks)"],
      tone: ["hypotonia ('floppy infant')", "hypertonia / spasticity", "asymmetrical limb movement"],
      milestone: ["not sitting by 9 mo", "not walking by 18 mo"]
    },
    redFlags: [
      "Asymmetric motor weakness or handedness before 1 year of age",
      "Progressive muscle weakness (Gowers sign, floppy infant)",
      "Loss of motor milestones"
    ]
  },
  {
    id: "ped_milestone_regression",
    label: "Loss of Developmental Milestones (Regression)",
    dimensions: {
      lostSkills: ["loss of speech / words", "loss of walking / sitting", "loss of hand function", "loss of eye contact"],
      onset: ["acute (days)", "subacute (weeks)", "gradual (months)"],
      associated: ["seizures", "ataxia", "behavioral changes"]
    },
    redFlags: [
      "STAT Neurological evaluation needed for developmental regression",
      "Associated with new-onset seizures, lethargy, or cranial nerve palsy",
      "Rapidly progressive loss of motor or cognitive functions"
    ]
  },
  {
    id: "ped_learning_difficulties",
    label: "Learning Difficulties",
    dimensions: {
      area: ["reading / dyslexia", "writing / dysgraphia", "mathematics / dyscalculia", "processing speed"],
      impact: ["school performance decline", "frustration / school refusal"],
      onset: ["early elementary", "middle school"]
    },
    redFlags: [
      "Sudden academic decline with headache, vision loss, or neurological deficit",
      "Co-occurring severe anxiety, depression, or self-harm thoughts",
      "Unexplained sensory deficits (unrecognized vision or hearing loss)"
    ]
  },
  {
    id: "ped_behavioral_concerns",
    label: "Behavioral Concerns",
    dimensions: {
      type: ["oppositional / defiant", "aggressive outbursts", "temper tantrums (> 15 mins)", "anxiety / phobias"],
      setting: ["home only", "school only", "multiple settings"],
      duration: ["< 1 month", "1-6 months", "> 6 months"]
    },
    redFlags: [
      "Aggressive behavior endangering self or others",
      "Sudden dramatic personality change following trauma",
      "Signs of physical, emotional, or sexual abuse"
    ]
  },
  {
    id: "ped_hyperactivity_inattention",
    label: "Hyperactivity / Inattention",
    dimensions: {
      subtype: ["inattentive", "hyperactive-impulsive", "combined"],
      settings: ["present in 2+ settings (home and school)"],
      onset: ["symptoms present before age 12"],
      impact: ["academic impairment", "peer conflict"]
    },
    redFlags: [
      "Sudden onset of severe inattention (rule out absence seizures, lead toxicity, thyroid disorder)",
      "Co-occurring severe mood disruption or psychosis",
      "Sleep deprivation or severe obstructive sleep apnea mimicking ADHD"
    ]
  },
  {
    id: "ped_social_interaction_difficulties",
    label: "Social Interaction Difficulties",
    dimensions: {
      features: ["poor eye contact", "lack of reciprocal social smiling", "difficulty making friends", "repetitive behaviors / stimming"],
      communication: ["literal interpretation of language", "unusual speech prosody / tone"],
      flexibility: ["intolerance to changes in routine", "intense narrow interests"]
    },
    redFlags: [
      "Complete social withdrawal or regression in communicative intent",
      "Inability to orient to name or auditory stimuli",
      "Severe distress or self-injurious behavior during routine changes"
    ]
  },
  {
    id: "ped_ear_tugging",
    label: "Ear Tugging",
    dimensions: {
      side: ["unilateral right", "unilateral left", "bilateral"],
      associated: ["fever", "fussy behavior", "crying when lying down", "recent upper respiratory infection"],
      frequency: ["frequent rubbing/pulling", "occasional"]
    },
    redFlags: [
      "Post-auricular erythema, tenderness, or swelling (Mastoiditis alert)",
      "Otorrhea (purulent or bloody ear discharge)",
      "High fever with neck stiffness or lethargy"
    ]
  },
  {
    id: "ped_refusal_to_walk_limp",
    label: "Refusal to Walk / Limp",
    dimensions: {
      onset: ["acute refusal to bear weight", "gradual antalgic limp"],
      location: ["hip", "knee", "ankle", "foot", "diffuse"],
      antecedent: ["recent viral illness (transient synovitis)", "trauma", "fever"]
    },
    redFlags: [
      "Inability to bear weight with high fever and severe localized pain (Septic Arthritis / Osteomyelitis)",
      "Bony point tenderness with localized warmth and erythema",
      "Night pain waking child from sleep"
    ]
  },
  {
    id: "ped_refusal_to_use_limb",
    label: "Refusal to Use a Limb",
    dimensions: {
      affected: ["upper extremity (arm/elbow/wrist)", "lower extremity (leg/knee/ankle)"],
      mechanism: ["sudden longitudinal traction on arm (Nursemaid's elbow / subluxed radial head)", "fall", "spontaneous"],
      position: ["arm held pronated and slightly flexed at elbow"]
    },
    redFlags: [
      "Deformity, severe swelling, or neurovascular deficit (absent pulse, cold hand/foot)",
      "Suspected non-accidental trauma (multiple unexplained fractures or bruising in non-ambulatory child)",
      "Severe pain with fever and local erythema"
    ]
  },
  {
    id: "ped_bulging_fontanelle",
    label: "Bulging Fontanelle",
    dimensions: {
      state: ["bulging while quiet and sitting upright", "bulging only during crying/straining (benign)"],
      associated: ["fever", "vomiting", "high-pitched cry", "lethargy", "seizures"],
      headCircumference: ["rapidly expanding curve"]
    },
    redFlags: [
      "Tense, bulging fontanelle at rest in a quiet upright infant (STAT rule out meningitis / intracranial pressure / hydrocephalus)",
      "Associated with high fever, neck stiffness, or altered consciousness",
      "Retinal hemorrhages or suspected trauma"
    ]
  },
  {
    id: "ped_sunken_fontanelle",
    label: "Sunken Fontanelle",
    dimensions: {
      severity: ["mildly depressed", "markedly sunken"],
      hydration: ["dry lips/tongue", "no tear production", "decreased wet diapers (< 3 in 24h)"],
      fluidLoss: ["recent vomiting", "watery diarrhea", "poor oral intake"]
    },
    redFlags: [
      "Markedly sunken fontanelle with delayed capillary refill (> 3s), cold extremities, and lethargy (Severe Hypovolemic Shock)",
      "Anuria > 12 hours",
      "Inability to retain oral fluids"
    ]
  },
  {
    id: "ped_delayed_puberty",
    label: "Delayed Puberty",
    dimensions: {
      female: ["no breast development by age 13", "no menarche by age 15 or > 3 yrs after thelarche"],
      male: ["no testicular enlargement (> 4 mL) by age 14"],
      associated: ["anosmia / hyposmia (Kallmann syndrome)", "short stature", "excessive exercise / low BMI"]
    },
    redFlags: [
      "Associated with persistent severe headaches, visual field defects, or vomiting (pituitary/hypothalamic lesion)",
      "Galactorrhea",
      "Stalled linear growth curve"
    ]
  },
  {
    id: "ped_precocious_puberty",
    label: "Precocious Puberty",
    dimensions: {
      female: ["breast or pubic hair development before age 8"],
      male: ["testicular enlargement or pubic hair before age 9"],
      type: ["central (gonadotropin-dependent)", "peripheral (gonadotropin-independent)"],
      progression: ["rapid advance in bone age and height velocity"]
    },
    redFlags: [
      "Rapidly progressing precocious puberty in young male (< 9 yrs) or young female (< 6 yrs) (central CNS tumor rule out)",
      "New severe headaches, visual disturbances, or seizures",
      "Unilateral abdominal or pelvic mass"
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
  },
  {
    id: "geri_frailty_weightloss",
    label: "Geriatric Frailty & Unintentional Weight Loss",
    dimensions: {
      features: ["unintentional loss > 5% body weight", "muscle wasting (Sarcopenia)", "slow gait speed", "weak grip strength"],
      duration: ["1-3 months", "6+ months"]
    },
    redFlags: [
      "Rapid unprovoked weight loss (> 10% in 6 months - Occult malignancy risk)",
      "Severe dysphagia or choking during meals",
      "Profound weakness preventing ADLs"
    ]
  },
  {
    id: "geri_polypharmacy",
    label: "Polypharmacy & Adverse Drug Effects",
    dimensions: {
      symptoms: ["orthostatic hypotension", "excessive sedation", "confusion", "dry mouth/urinary retention (Anticholinergic)"],
      medications: ["> 5 chronic medications", "recent new prescription or dose adjustment"]
    },
    redFlags: [
      "Acute delirium following medication change",
      "Severe bradycardia or syncopal spell",
      "Drug-induced GI bleeding or acute renal injury"
    ]
  },
  {
    id: "geri_incontinence_immobility",
    label: "Urinary / Fecal Incontinence & Immobility",
    dimensions: {
      type: ["urge incontinence", "stress incontinence", "overflow/dribbling", "functional (cannot reach toilet)"],
      onset: ["acute onset", "chronic progressive"]
    },
    redFlags: [
      "Acute urinary retention with severe lower abdominal pain",
      "Sudden onset incontinence with bilateral leg weakness or saddle numbness (Cauda Equina)"
    ]
  },
  {
    id: "geri_pressure_injury",
    label: "Skin Breakdown & Pressure Ulcers",
    dimensions: {
      location: ["sacrum/coccyx", "heels", "hips/trochanter", "ischial tuberosities"],
      stage: ["non-blanchable redness (Stage 1)", "partial skin loss (Stage 2)", "full thickness necrosis (Stage 3/4)"]
    },
    redFlags: [
      "Foul smelling purulent discharge with surrounding cellulitis/erythema",
      "Systemic signs of sepsis (fever, hypothermia, confusion)",
      "Exposed bone or muscle (Stage 4 - Osteomyelitis risk)"
    ]
  },
  {
    id: "geri_failure_to_thrive",
    label: "Elderly Failure to Thrive & Anorexia",
    dimensions: {
      symptoms: ["refusal to eat/drink", "apathy and social withdrawal", "profound fatigue", "functional dependence"],
      contributors: ["depression", "poor dentition/ill-fitting dentures", "social isolation", "chronic pain"]
    },
    redFlags: [
      "Severe electrolyte imbalance or acute kidney injury from dehydration",
      "Severe malnutrition with pressure ulcers"
    ]
  }
];

export const TRAUMA_MODELS: SymptomModel[] = [
  {
    id: "trauma_head_concussion",
    label: "Head Injury & Concussion (TBI)",
    dimensions: {
      mechanism: ["motor vehicle collision", "fall from height", "direct blow / assault", "sports / blast injury"],
      lossOfConsciousness: ["none", "< 1 minute", "1 to 5 minutes", "> 5 minutes"],
      symptoms: ["retrograde/anterograde amnesia", "confusion/fogginess", "dizziness/vertigo", "persistent nausea/vomiting", "worsening headache", "photophobia/phonophobia"],
      neckPain: ["present", "absent"]
    },
    redFlags: [
      "Loss of consciousness > 1 minute",
      "Repeated vomiting (> 2 episodes)",
      "Worsening confusion, drowsiness, or altered level of consciousness",
      "Post-traumatic seizure",
      "Anisocoria (unequal pupils) or focal neurological deficit",
      "Clear fluid draining from nose or ears (CSF leak) or Battle sign"
    ]
  },
  {
    id: "trauma_blunt_chest",
    label: "Blunt Chest Trauma & Rib Injury",
    dimensions: {
      mechanism: ["direct impact / assault", "seatbelt sign", "steering wheel impact", "crush injury"],
      symptoms: ["sharp localized chest pain", "pain aggravated by deep inspiration or coughing", "shortness of breath", "bony crepitus / crunching sensation"],
      location: ["anterior sternum", "lateral rib cage", "posterior thoracic"]
    },
    redFlags: [
      "Paradoxical chest wall movement (Flail chest segment)",
      "Severe dyspnea, tachypnea, or hypoxia (SpO2 < 90%)",
      "Tracheal deviation or unilateral absent breath sounds (Tension pneumothorax)",
      "Subcutaneous emphysema (extensive air under skin)",
      "Hypotension or signs of hemorrhagic/obstructive shock"
    ]
  },
  {
    id: "trauma_blunt_abdominal",
    label: "Blunt Abdominal & Pelvic Trauma",
    dimensions: {
      mechanism: ["high-velocity MVA", "bicycle handlebar impact", "fall onto object", "direct assault"],
      location: ["right upper quadrant (liver)", "left upper quadrant / left shoulder tip (spleen)", "generalized abdominal", "suprapubic / pelvic"],
      findings: ["abdominal distension", "tenderness to palpation", "flank ecchymosis (Grey Turner sign)", "periumbilical ecchymosis (Cullen sign)", "seatbelt sign mark"]
    },
    redFlags: [
      "Hemodynamic instability (tachycardia with persistent hypotension)",
      "Involuntary abdominal guarding, rigidity, or rebound tenderness (Peritonitis)",
      "Kehr sign (severe left shoulder pain from diaphragmatic irritation by splenic rupture)",
      "Gross hematuria or blood at the urethral meatus",
      "Pelvic ring instability or crunching on palpation"
    ]
  },
  {
    id: "trauma_extremity_fracture",
    label: "Fracture, Dislocation & Limb Trauma",
    dimensions: {
      location: ["upper extremity (shoulder/arm/hand)", "lower extremity (hip/femur/knee/ankle)", "pelvis", "multiple sites"],
      findings: ["gross bony deformity", "inability to bear weight", "focal bony tenderness", "joint dislocation"],
      skinStatus: ["intact skin (closed injury)", "open wound / bone visible (open fracture)"]
    },
    redFlags: [
      "Open fracture (bone protruding or skin break communicating with fracture)",
      "Neurovascular compromise (cold, pale, pulseless extremity or distal sensory loss)",
      "Compartment syndrome (severe pain out of proportion, pain with passive stretch, tense swollen compartment)",
      "Bilateral femur or pelvic ring fractures (high risk of massive hemorrhage)"
    ]
  },
  {
    id: "trauma_penetrating_injury",
    label: "Penetrating Trauma (Stab / Laceration / GSW)",
    dimensions: {
      type: ["deep laceration / cut", "stab wound", "puncture", "ballistic / gunshot wound"],
      region: ["neck / airway", "chest / thorax", "abdomen / flank", "groin / femoral region", "extremity"],
      bleeding: ["pulsatile / spurting arterial", "steady venous oozing", "controlled with pressure"]
    },
    redFlags: [
      "Pulsatile arterial bleeding or expanding hematoma",
      "Penetrating wound to the 'precordial box' or central torso",
      "Evisceration (protruding abdominal viscera / bowel)",
      "Impaled object in situ (do NOT remove in field)",
      "Acute distal motor/sensory deficit"
    ]
  },
  {
    id: "trauma_burn_thermal_chemical",
    label: "Burns (Thermal, Chemical, Electrical)",
    dimensions: {
      cause: ["flame / scalding liquid", "chemical contact / spill", "high-voltage electrical shock", "flash / contact burn"],
      depth: ["1st degree (superficial erythema)", "2nd degree (blisters / painful partial thickness)", "3rd degree (charred / waxy white full thickness)"],
      extent: ["< 5% TBSA", "5% to 15% TBSA", "> 15% TBSA", "involves critical areas (face, hands, feet, perineum, major joints)"]
    },
    redFlags: [
      "Inhalation injury (facial burns, singed nasal hairs, carbonaceous sputum, stridor)",
      "High-voltage electrical injury (risk of cardiac arrhythmias and deep compartment necrosis)",
      "Large total body surface area burn (> 10-15% TBSA requiring rapid fluid resuscitation)",
      "Circumferential burn to limb or chest wall (compartment syndrome / restricted ventilation)"
    ]
  },
  {
    id: "trauma_spine_cord_injury",
    label: "Spinal Trauma & Cord Injury",
    dimensions: {
      mechanism: ["high-speed MVA", "diving into shallow water", "fall from height (> 2m)", "heavy axial load"],
      neurological: ["bilateral numbness or paresthesia", "focal muscle weakness / paraplegia / tetraplegia", "loss of pain/temperature level"],
      sphincter: ["loss of bowel or bladder control", "urinary retention", "priapism"]
    },
    redFlags: [
      "Acute motor weakness, paralysis, or sensory level loss",
      "Loss of bowel/bladder sphincter tone",
      "Neurogenic shock (hypotension with relative bradycardia and warm skin)",
      "Severe focal midline spinal tenderness with step-off deformity"
    ]
  },
  {
    id: "trauma_soft_tissue_laceration",
    label: "Crush Injury, Lacerations & Soft Tissue",
    dimensions: {
      type: ["deep laceration", "crush injury", "major contusion / hematoma", "avulsion / degloving"],
      contamination: ["clean surgical/glass cut", "dirty / soil / rust exposure", "animal / human bite"],
      bleeding: ["controlled with pressure", "persistent active oozing"]
    },
    redFlags: [
      "Crush syndrome risk (prolonged compression > 2 hrs with risk of rhabdomyolysis and hyperkalemia)",
      "Active arterial hemorrhage or expanding hematoma",
      "Tendon, major nerve, or ductal laceration",
      "High tetanus risk dirty wound with necrotic tissue"
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
  trauma: TRAUMA_MODELS,
};
