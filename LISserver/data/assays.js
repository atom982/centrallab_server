// BIH MEDICINSKI LABORATORIJ

// Stupska 1F, Sarajevo (Stup), $store.state.site: 5c69f68c338fe912f99f833b

let s_bt1500 = ["ACP", "ALB", "ALP", "ALT", "AMM", "AMY", "ASO", "AST", "AUR", "BIC", "BID", "BIT", "C3", "C4", "CAL", "CARB", "CERU", "CKMB",
  "CPK", "CRE", "CRP", "CRPD", "CU", "DDIM", "FE", "FRU", "GGT", "GLU", "GLUH", "HAP", "HBA1", "HBAI", "HCY", "HDL", "HLOR", "HOL", "IGA",
  "IGG", "IGM", "K", "LAK", "LDH", "LIP", "LITH", "MAG", "NA", "PHO", "PRO", "PROU", "RF", "TIBC", "TRG", "UIBC", "URE", "VALP", "VPA", "ZN"]; 

let s_liaison = ["25OHD", "25VITD", "aCL-G", "aCL-M", "ACTHDS", "AFP", "a-HAV", "a-HBc", "a-HBs", "aHBsII", "ALDO", "ANA-Sc", "a-Tg", "a-TPO",
  "B2MS", "B2MU", "BoGCSF", "Bor-G", "Bor-M", "BorM-2", "BPT-A", "BPT-G", "CA125", "CA15-3", "CA19-9", "CALPRO", "Cav-NT", "Cav-T", "CEA",
  "CGAvII", "CMV-Av", "CMVGII", "CMVMII", "Cort", "CortS", "CortU", "C-Pep", "C-PepS", "CT", "DHEAS", "DNA-G", "E2Gen", "EA-G", "EBNA-G",
  "EBV-M", "ENA-Sc", "Ferr", "fPSA", "FSH", "FT3", "FT4", "GH", "HAV-M", "HBc-M", "HBeAg", "HBsAg", "HCG", "HSV-G", "HSV-M", "IGF-I", "Ins",
  "LH", "Myco-G", "NSE", "Osteo", "Parv-G", "Parv-M", "PR2Gen", "Prog", "Prol", "PSA", "PTH2DS", "Ren", "Rube-G", "Rub-M", "S100", "T3", "T4",
  "TAv2NT", "TESTO2", "Tg", "TGAv", "ToxAv2", "Tox-G2", "Toxo-M", "Trep", "TSH", "tTG-A", "VCA-G", "VZV-G", "VZV-M"];

// Branilaca Sarajeva 45, Sarajevo (Centar 45), $store.state.site: 5c6b3386c6543501079f4889

let c_bt1500 = ["ALB", "ALP", "ALT", "AMY", "ASO", "AST", "AURS", "AURU", "BID", "BIT", "CAL", "CPK", "CRE", "CRP", "DDIM", "FE", "GGT", "GLU",
  "HBA1", "HDL", "HLOR", "HOL", "K", "LDH", "LDL", "LIP", "MAG", "NA", "PRO", "RF", "TIBC", "TRG", "UIBC", "URE"];

let c_e170 = ["162", "50", "88", "286", "472", "137", "266", "224", "53", "52", "54", "55", 
  "63", "142", "115", "67", "721", "68", "195", "309", "148", "502", "281", "111", "116", "14", "91", 
  "235", "126", "160", "7", "2", "216", "39", "51", "1", "459"]; 
  // "202", "85", "133", "49", "9", "11", "89", "186", "223", "23", "4", "250", "20", "155", "105", "106", "25", "146", "169", "98", "95", 

// Ulica Šehida 17a, Travnik, $store.state.site: 5c6b34d4c6543501079f488b

let t_bt1500 = ["ACP", "ALB", "ALP", "ALT", "AMM", "AMY", "ASO", "AST", "ASTS", "AUR", "B2MI", "BIC", "BID", "BIT", "C3", "C4", "CAL", "CARB",
  "CERU", "CHE", "CKMB", "CPK", "CRE", "CRP", "CRPD", "CU", "DDIM", "FE", "FER", "FESB", "FR", "FRU", "FRUR", "GGT", "GLU", "HAP", "HBA1", 
  "HBAI", "HCY", "HDL", "HLOR", "HOL", "IGA", "IGG", "IGM", "K", "LAK", "LDH", "LDHD", "LDL", "LIP", "LITH", "MAG", "NA", "PHO", "PRO", "PROU",
  "RF", "TIBC", "TRF", "TRG", "UAD", "UIBC", "URE", "VALP", "VPA", "ZN"];

// Nije registrovano
// "ASTS", "B2MI", "CHE", "FER", "FESB", "FR", "FRUR", "LDHD", "TRF", "UAD",
let e_ilab650 = ["001", "002", "003", "004", "005", "007", "008", "009", "011", "012", "013", "014", "015",
   "016", "017", "018", "019", "020", "021", "022", "023", "024", "025", "026", "027", "028", "029", "030", "031", "032","033","034","035","036","037","038","081"]; 

module.exports = {
  s_bt1500,
  s_liaison,
  c_bt1500,
  c_e170,
  t_bt1500,
  e_ilab650
};
