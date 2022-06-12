var fs = require("fs");
const config = require("../config/index");
// nalaz.site.naziv,nalaz.site.sifra,nalaz.site.web, naslov, text,nalaz.site.opis,nalaz.site.adresa,nalaz.site.email,nalaz.site.telefon)
module.exports = {
  MailTemplate: function(
    naziv,
    sifra,
    web,
    naslov,
    text,
    opis,
    adresa,
    email,
    telefon,
    mob
  ) {
    var head =
      "<!DOCTYPE html><html><head><title>" +
      naziv +
      ' - Nalaz</title> <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge" />';
    var style =
      '<style type="text/css">' +
      fs.createReadStream(config.mail_template_path + "style.css") +
      "</style></head>";
    var body =
      '<body style="margin: 0 !important; padding: 0 !important;">' +
      "<!-- HIDDEN PREHEADER TEXT -->" +
      '<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">' +
      "Poštovani,  u prilogu Vam dostavljamo rezultate laboratorijskih pretraga. Vaš " +
      naziv +
      "</div>" +
      "<!-- HEADER -->" +
      '<table border="0" cellpadding="0" cellspacing="0" width="100%">' +
      "<tr>" +
      '<td bgcolor="#FFFFFF" align="center">' +
      '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px;" class="wrapper">' + 
      "</table>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td bgcolor="#ffffff" align="center" style="padding: 25px 15px 70px 15px;" class="section-padding">' +
      '<table border="0" cellpadding="0" cellspacing="0" width="500" class="responsive-table">' +
      "<tr>" +
      "<td>" +
      '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
      "<tr>" +
      "<td>" +
      "<!-- COPY -->" +
      '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
      "<tr>" +
      '<td align="center" style="font-size: 25px; font-family: Helvetica, Arial, sans-serif; color: #333333; padding-top: 10px;" class="padding-copy">' +
      naslov +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td align="center" style="padding: 20px 0 0 0; font-size: 16px; line-height: 25px; font-family: Helvetica, Arial, sans-serif; color: #666666;" class="padding-copy">' +
      text +
      "</td>" +
      " </tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td align="center">' +
      "<!-- BULLETPROOF BUTTON -->" +
      '<table width="100%" border="0" cellspacing="0" cellpadding="0">' +
      "<tr>" +
      '<td align="center" style="padding-top: 0px;" class="padding">' +
      '<table border="0" cellspacing="0" cellpadding="0" class="mobile-button-container">' +      
      "</table>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "<tr>" +
      '<td bgcolor="#ffffff" align="center" style="padding: 20px 0px;">' +
      '<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 500px;" class="responsive-table">' +
      "<tr>" +
      '<td align="center" style="font-size: 12px; line-height: 18px; font-family: Helvetica, Arial, sans-serif; color:#666666;">' +
      opis +     
      "<br>" +
      adresa +
      "<br>" +
      "e-mail: " +
      email +
      ", tel: " +
      telefon + ", mob: " + mob +
      "<br>" +
      "Facebook: " +
      web +
      "<br>" +
      '<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center" style="max-width: 480px;" class="responsive-table">' +
      '<hr style="border-top: 5px solid #66C3D0;">' +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</td>" +
      "</tr>" +
      "</table>" +
      "</body>" +
      "" +
      "</html> ";

    return head + style + body;
  }
};