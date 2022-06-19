var interpretacija = require("./interpretacija");

module.exports = {
  Interpretation: function(test, result, jedinica, dref, gref, site, interp, extend, spec) {
   
    var rezultat = result.trim()

    switch (interp) {
     case "none":
        return [test, rezultat, interpretacija.None(rezultat, dref, gref)[0], jedinica, "/", interpretacija.None(rezultat, dref, gref)[1], extend];
        break;
      case "A":
        return [test, rezultat, interpretacija.Standard(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.Standard(rezultat, dref, gref)[1], extend];
        break;
      case "ogtt":        
        if(dref == "0" && gref == "0"){
          var reference = "/"
        }else{
          var reference = dref + " - " + gref
        }
        return [test, rezultat, interpretacija.Standard(rezultat, dref, gref)[0], jedinica, reference, interpretacija.Standard(rezultat, dref, gref)[1], extend];
        break; 
        break;
      case "insul":
        if(dref == "0" && gref == "0"){
          var reference = "/"
        }else{
          var reference = dref + " - " + gref
        }
        return [test, rezultat, interpretacija.Standard(rezultat, dref, gref)[0], jedinica, reference, interpretacija.Standard(rezultat, dref, gref)[1], extend];
        break;
      case "less":
        return [test, rezultat, interpretacija.Less(rezultat, dref, gref)[0], jedinica, " < " + gref, interpretacija.Less(rezultat, dref, gref)[1], extend];              
        break;
      case "lesseq":
        return [test, rezultat, interpretacija.LessEqual(rezultat, dref, gref)[0], jedinica, " ≤ " + gref, interpretacija.LessEqual(rezultat, dref, gref)[1], extend];             
        break;
      case "lesspl":
          return [test, rezultat, interpretacija.LessPlus(rezultat, dref, gref)[0], jedinica, " < " + gref + " x 10^6", interpretacija.LessPlus(rezultat, dref, gref)[1], extend];             
          break; 
      case "infekc":
        return [test, rezultat, interpretacija.Infekcija(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.Infekcija(rezultat, dref, gref)[1], extend];             
        break; 
      case "grt":
        return [test, rezultat, interpretacija.Greater(rezultat, dref, gref)[0], jedinica, " > " + gref, interpretacija.Greater(rezultat, dref, gref)[1], extend];        
        break; 
      case "grtpl":
          return [test, rezultat, interpretacija.Greater(rezultat, dref, gref)[0], jedinica, " > " + gref + " x 10^6", interpretacija.Greater(rezultat, dref, gref)[1], extend];        
          break; 
      case "grtepl":
            return [test, rezultat, interpretacija.GreaterEqual(rezultat, dref, gref)[0], jedinica, " ≥ " + gref + " x 10^6", interpretacija.GreaterEqual(rezultat, dref, gref)[1], extend];        
            break; 
      case "grtno":
          return [test, rezultat, interpretacija.GreaterNoInterp(rezultat, dref, gref)[0], jedinica, " > " + gref, interpretacija.GreaterNoInterp(rezultat, dref, gref)[1], extend];        
          break; 
      case "grte":
        return [test, rezultat, interpretacija.GreaterEqual(rezultat, dref, gref)[0], jedinica, " ≥ " + gref, interpretacija.GreaterEqual(rezultat, dref, gref)[1], extend];        
        break;  
      case "neg":
        return [test, rezultat, interpretacija.Negativan(rezultat, dref, gref)[0], jedinica, "negativan", interpretacija.Negativan(rezultat, dref, gref)[1], extend];
        break;
      case "antigen":
        return [test, rezultat, interpretacija.Antigen(rezultat, dref, gref)[0], jedinica, interpretacija.Antigen(rezultat, dref, gref)[2], interpretacija.Antigen(rezultat, dref, gref)[1], extend];
        break;
      case "trag":
        return [test, rezultat, interpretacija.Trag(rezultat, dref, gref)[0], jedinica, "trag", interpretacija.Trag(rezultat, dref, gref)[1], extend];
        break;
      case "reakt":
        return [test, rezultat, interpretacija.Reaktivan(rezultat, dref, gref)[0], jedinica, "nereaktivan", interpretacija.Reaktivan(rezultat, dref, gref)[1], extend];
        break;
      case "cov2":
        return [test, rezultat, interpretacija.COV2(rezultat, dref, gref)[0], jedinica, " < " + gref, interpretacija.COV2(rezultat, dref, gref)[1], extend];
        break;
      case "norm":
        return [test, rezultat, interpretacija.Normalan(rezultat, dref, gref)[0], jedinica, "normalna", interpretacija.Normalan(rezultat, dref, gref)[1], extend];
        break;
      case "norma":
        return [test, rezultat, interpretacija.Normalan(rezultat, dref, gref)[0], jedinica, "normalan", interpretacija.Normalan(rezultat, dref, gref)[1], extend];
        break;
      case "ured":
        return [test, rezultat, interpretacija.Uredan(rezultat, dref, gref)[0], jedinica, "uredna", interpretacija.Uredan(rezultat, dref, gref)[1], extend];
        break;
      case "plus":
        return [test, rezultat, interpretacija.Plus(rezultat, dref, gref)[0], jedinica, "+ + +", interpretacija.Plus(rezultat, dref, gref)[1], extend];
        break;
      case "morf":
        return [test, rezultat, interpretacija.Morf(rezultat, dref, gref)[0], jedinica, gref, interpretacija.Morf(rezultat, dref, gref)[1], extend];
        break;
      case "titar":
          return [test, rezultat, interpretacija.Titar(rezultat, dref, gref)[0], jedinica, "< " + dref + ":" + gref, interpretacija.Titar(rezultat, dref, gref)[1], extend];
          break;
      case "tsh":
        return [test, rezultat, interpretacija.TSH(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.TSH(rezultat, dref, gref)[1], extend];
        break; 
      case "trg":      
        return [test, rezultat, interpretacija.TRG(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.TRG(rezultat, dref, gref)[1], extend];
        break;
      case "hol":      
        return [test, rezultat, interpretacija.HOL(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.HOL(rezultat, dref, gref)[1], extend];
        break;
      case "hdl":      
        return [test, rezultat, interpretacija.HDL(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.HDL(rezultat, dref, gref)[1], extend];
        break;
      case "ldl":      
        return [test, rezultat, interpretacija.LDL(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.LDL(rezultat, dref, gref)[1], extend];
        break;
      case "fpsa":      
        return [test, rezultat, interpretacija.fPSA(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.fPSA(rezultat, dref, gref)[1], extend];
        break;
      case "sediment":
        return [test, rezultat, interpretacija.Sedimentacija(rezultat, dref, gref)[0], jedinica, "< " + gref, interpretacija.Sedimentacija(rezultat, dref, gref)[1], extend];
        break;
      case "bistar":
        return [test, rezultat, interpretacija.Bistar(rezultat, dref, gref)[0], jedinica, "bistar", interpretacija.Bistar(rezultat, dref, gref)[1], extend];
        break;
      case "boja":
        return [test, rezultat, interpretacija.Boja(rezultat, dref, gref)[0], jedinica, "žuta", interpretacija.Boja(rezultat, dref, gref)[1], extend];
        break;  
      case "bojasp":
          return [test, rezultat, interpretacija.BojaSpermiogram(rezultat, dref, gref)[0], jedinica, "blijedo žut", interpretacija.BojaSpermiogram(rezultat, dref, gref)[1], extend];
          break;      
      case "nesto":
        return [test, rezultat, interpretacija.Nesto(rezultat, dref, gref)[0], jedinica, "nešto", interpretacija.Nesto(rezultat, dref, gref)[1], extend];
        break;
      case "exists":
        return [test, rezultat, interpretacija.Exists(rezultat, dref, gref)[0], jedinica, " ", interpretacija.Exists(rezultat, dref, gref)[1], extend];
        break;
      case "prisutno":
        return [test, rezultat, interpretacija.Prisutno(rezultat, dref, gref)[0], jedinica, "0", interpretacija.Prisutno(rezultat, dref, gref)[1], extend];
        break;
      case "gljivice":
        return [test, rezultat, interpretacija.Gljivice(rezultat, dref, gref)[0], jedinica, "0", interpretacija.Gljivice(rezultat, dref, gref)[1], extend];
        break;
      case "leuer":
          return [test, rezultat, interpretacija.LeuEr(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.LeuEr(rezultat, dref, gref)[1], extend];
          break;
      case "nema":
          return [test, rezultat, interpretacija.Nema(rezultat, dref, gref)[0], jedinica, "nema", interpretacija.Nema(rezultat, dref, gref)[1], extend];
          break;
      case "blst":
        return [test, rezultat, interpretacija.Blasti(rezultat, dref, gref)[0], jedinica, gref, interpretacija.Blasti(rezultat, dref, gref)[1], extend];
        break;
      case "leu":      
        return [test, rezultat, interpretacija.LeuErc(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.LeuErc(rezultat, dref, gref)[1], extend];
        break;
      case "spec":      
        return [test, rezultat, interpretacija.Specific(rezultat, dref, gref)[0], jedinica, spec, interpretacija.Specific(rezultat, dref, gref)[1], extend];
        break; 

        case "pH":      
        return [test, rezultat, interpretacija.pH(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.pH(rezultat, dref, gref)[1], extend];
        
        break;

        case "SG":   
        return [test, rezultat, interpretacija.SG(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.SG(rezultat, dref, gref)[1], extend];   
        
        break;

        case "URO":      
        return [test, rezultat, interpretacija.URO(rezultat, dref, gref)[0], jedinica, " < " + gref, interpretacija.URO(rezultat, dref, gref)[1], extend];   
        
        break;

      // Spermiogram

      case "e0x":      
        return [test, rezultat, interpretacija.None(rezultat, dref, gref)[0], jedinica, "", interpretacija.None(rezultat, dref, gref)[1], extend];
        break;
      case "e02":      
        return [test, rezultat, interpretacija.SpermKolicina(rezultat, dref, gref)[0], jedinica, "da", interpretacija.SpermKolicina(rezultat, dref, gref)[1], extend];
        break;
      case "e04":      
        return [test, rezultat, interpretacija.SpermIzgled(rezultat, dref, gref)[0], jedinica, "uredan", interpretacija.SpermIzgled(rezultat, dref, gref)[1], extend];
        break;
      case "e05":      
        return [test, rezultat, interpretacija.SpermBoja(rezultat, dref, gref)[0], jedinica, "sivo bijela", interpretacija.SpermBoja(rezultat, dref, gref)[1], extend];
        break;
      case "e07":      
        return [test, rezultat, interpretacija.SpermLikvefakcija(rezultat, dref, gref)[0], jedinica, dref + " - " + gref, interpretacija.SpermLikvefakcija(rezultat, dref, gref)[1], extend];
        break;
      case "e08":      
        return [test, rezultat, interpretacija.SpermAglutinacija(rezultat, dref, gref)[0], jedinica, "nije prisutna", interpretacija.SpermAglutinacija(rezultat, dref, gref)[1], extend];
        break;    

      // Pregled sedimenta urina - mikroskopski pregled

      case "s01": // Epitelne stanice     
        return [test, rezultat, interpretacija.EpitelneStanice(rezultat, dref, gref)[0], jedinica, interpretacija.EpitelneStanice(rezultat, dref, gref)[2], interpretacija.EpitelneStanice(rezultat, dref, gref)[1], extend];
        break;
      case "s02": // Kristali      
        return [test, rezultat, interpretacija.Kristali(rezultat, dref, gref)[0], jedinica, interpretacija.Kristali(rezultat, dref, gref)[2], interpretacija.Kristali(rezultat, dref, gref)[1], extend];
        break;
      case "s03": // Soli    
        return [test, rezultat, interpretacija.Soli(rezultat, dref, gref)[0], jedinica, "rijedak", interpretacija.Soli(rezultat, dref, gref)[1], extend];
        break;
      case "u06": // Bakterije    
        return [test, rezultat, interpretacija.Bakterije(rezultat, dref, gref)[0], jedinica, "malo", interpretacija.Bakterije(rezultat, dref, gref)[1], extend];
        break;

      default:
        return [test, rezultat, interpretacija.None(rezultat, dref, gref)[0], jedinica, "/", interpretacija.None(rezultat, dref, gref)[1], extend];
        break;
    }
  }
};
