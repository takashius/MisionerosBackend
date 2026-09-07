import { numFormat } from "../utils";
export default (
  title: string,
  message: string,
  config: any,
  name: string,
  cotiza: any
) => {
  const separator = `
    <!-- Start of separator -->
    <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" st-sortable="seperator">
    <tbody>
        <tr>
            <td>
                <table width="600" align="center" cellspacing="0" cellpadding="0" border="0" class="devicewidth">
                <tbody>
                    <tr>
                        <td align="center" height="30" style="font-size:1px; line-height:1px;">&nbsp;</td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- End of separator -->
    `;
  let body = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${title}</title>
        
        <style type="text/css">
            /* Client-specific Styles */
            #outlook a {padding:0;} /* Force Outlook to provide a "view in browser" menu link. */
            body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}
            /* Prevent Webkit and Windows Mobile platforms from changing default font sizes, while not breaking desktop design. */
            .ExternalClass {width:100%;} /* Force Hotmail to display emails at full width */
            .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;} /* Force Hotmail to display normal line spacing.  */
            #backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}
            img {outline:none; text-decoration:none;border:none; -ms-interpolation-mode: bicubic;}
            a img {border:none;}
            .image_fix {display:block;}
            p {margin: 0px 0px !important;}
            table td {border-collapse: collapse;}
            table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
            a {color: #33b9ff;text-decoration: none;text-decoration:none!important;}
            /*STYLES*/
            table[class=full] { width: 100%; clear: both; }
            /*IPAD STYLES*/
            @media only screen and (max-width: 640px) {
            a[href^="tel"], a[href^="sms"] {
            text-decoration: none;
            color: #33b9ff; /* or whatever your want */
            pointer-events: none;
            cursor: default;
            }
            .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
            text-decoration: default;
            color: #33b9ff !important;
            pointer-events: auto;
            cursor: default;
            }
            table[class=devicewidth] {width: 440px!important;text-align:center!important;}
            table[class=devicewidthinner] {width: 420px!important;text-align:center!important;}
            img[class=banner] {width: 440px!important;height:220px!important;}
            img[class=colimg2] {width: 440px!important;height:220px!important;}
            
            
            }
            /*IPHONE STYLES*/
            @media only screen and (max-width: 480px) {
            a[href^="tel"], a[href^="sms"] {
            text-decoration: none;
            color: #ffffff; /* or whatever your want */
            pointer-events: none;
            cursor: default;
            }
            .mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
            text-decoration: default;
            color: #ffffff !important; 
            pointer-events: auto;
            cursor: default;
            }
            table[class=devicewidth] {width: 280px!important;text-align:center!important;}
            table[class=devicewidthinner] {width: 260px!important;text-align:center!important;}
            img[class=banner] {width: 280px!important;height:140px!important;}
            img[class=colimg2] {width: 280px!important;height:140px!important;}
            td[class="padding-top15"]{padding-top:15px!important;}
            
            
            }
        </style>
    </head>
    <body>    
    ${separator}
    <!-- Start of header -->
    <table width="100%" bgcolor="${
      config.configMail.colors.background
    }" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" st-sortable="header">
    <tbody>
        <tr>
            <td>
                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                <tbody>
                    <tr>
                        <td width="100%">
                            <table bgcolor="#FFFFFF" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                            <tbody>
                                <!-- Spacing -->
                                <tr>
                                    <td height="5" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td>
                                        <!-- logo -->
                                        <table width="140" align="left" border="0" cellpadding="0" cellspacing="0" class="devicewidth">
                                        <tbody>
                                            <tr>
                                                <td width="140" height="70" align="center">
                                                    <div class="imgpop">
                                                        <img src="${
                                                          config.logo
                                                        }" alt="" border="0" height="60" style="display:block; padding: 5px; border:none; outline:none; text-decoration:none;">
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                        </table>
                                        <!-- end of logo -->
                                        <!-- start of menu -->
                                        <table width="250" border="0" align="right" valign="middle" cellpadding="0" cellspacing="0" border="0" class="devicewidth">
                                        <tbody>
                                            <tr>
                                                <td align="center" style="font-family: Helvetica, arial, sans-serif; font-size: 20px;color: ${
                                                  config.configMail.colors
                                                    .primary
                                                }" st-content="phone"  height="60">
                                                    Tel: ${
                                                      config.phone
                                                        ? config.phone
                                                        : ""
                                                    }
                                                </td>
                                            </tr>
                                        </tbody>
                                        </table>
                                        <!-- end of menu -->
                                    </td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td height="5" style="font-size:1px; line-height:1px; mso-line-height-rule: exactly;">&nbsp;</td>
                                </tr>
                                <!-- Spacing -->
                            </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- End of Header -->
    `;
  if (config.banner) {
    body += `
        <!-- Start of main-banner -->
        <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" st-sortable="banner">
        <tbody>
            <tr>
                <td>
                    <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                    <tbody>
                        <tr>
                            <td width="100%">
                                <table width="600" align="center" cellspacing="0" cellpadding="0" border="0" class="devicewidth">
                                <tbody>
                                    <tr>
                                        <!-- start of image -->
                                        <td align="center" st-image="banner-image">
                                            <div class="imgpop">
                                                <img width="600" border="0" height="300" alt="" border="0" style="display:block; border:none; outline:none; text-decoration:none;" src="${config.banner}" class="banner" />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                                </table>
                                <!-- end of image -->
                            </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
        </table>
        <!-- End of main-banner -->  
        `;
  }
  body += `
    ${separator}
    <!-- Start of heading -->
    <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" st-sortable="seperator">
    <tbody>
        <tr>
            <td>
                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                <tbody>
                    <tr>
                        <td width="100%">
                            <table bgcolor="${config.configMail.colors.primary}" width="600" align="center" cellspacing="0" cellpadding="0" border="0" class="devicewidth">
                            <tbody>
                                <tr>
                                    <td align="center" style="font-family: Helvetica, arial, sans-serif; font-size: 24px; color: ${config.configMail.colors.title}; padding: 15px 0;" st-content="heading" bgcolor="${config.configMail.colors.primary}" align="center">
                                        ${title}
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- End of heading --> 
    <!-- article -->
    <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable">
    <tbody>
        <tr>
            <td>
                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                <tbody>
                    <tr>
                        <td width="100%">
                            <table bgcolor="#ffffff" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                            <tbody>
                                <!-- Spacing -->
                                <tr>
                                    <td height="20"></td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td>
                                        <table width="560" align="center" border="0" cellpadding="0" cellspacing="0" class="devicewidthinner">
                                            <tbody>
                                                <tr>
                                                    <td>Hola ${name}, <br/>&nbsp;</td>
                                                </tr>
                                                <!-- Spacing -->
                                                <tr>
                                                    <td width="100%" height="10"></td>
                                                </tr>
                                                <!-- Spacing -->
                                                <!-- content -->
                                                <tr>
                                                    <td style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: #4f5458; text-align:left; line-height: 20px;">
                                                        ${message}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td height="20"></td>
                                </tr>
                                <!-- Spacing -->
                                <!-- bottom-border -->
                                <tr>
                                    <td width="100%" bgcolor="${config.configMail.colors.primary}" height="3" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                </tr>
                                <!-- /bottom-border -->
                            </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- end of article -->
    `;

  if (cotiza) {
    body += `
        ${separator}
        <!-- Start of cabecera de presupuesto -->
        <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" st-sortable="seperator">
        <tbody>
            <tr>
                <td>
                    <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                    <tbody>
                        <tr>
                            <td width="100%">
                                <table bgcolor="${config.configMail.colors.primary}" width="600" align="center" cellspacing="0" cellpadding="0" border="0" class="devicewidth">
                                <tbody>
                                    <tr>
                                        <td align="center" style="font-family: Helvetica, arial, sans-serif; font-size: 24px; color: ${config.configMail.colors.title}; padding: 15px 0;" st-content="heading" bgcolor="${config.configMail.colors.primary}" align="center">
                                            Su presupuesto <b>${cotiza.number}</b>
                                        </td>
                                    </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
        </table>
        <!-- End of cabecera de presupuesto --> 
        `;

    let tabla = `
    <!-- Presupuesto -->
    <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable">
    <tbody>
        <tr>
            <td>
                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                <tbody>
                    <tr>
                        <td width="100%">
                            <table bgcolor="#ffffff" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                            <tbody>
                                <!-- Spacing -->
                                <tr>
                                    <td height="20"></td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td>
                                        <table width="560" align="center" border="1" bordercolor="${config.configMail.colors.secundary}" cellpadding="0" cellspacing="0" class="devicewidthinner">
                                            
                                            <tbody>
                                                <!-- title -->
                                                <tr bgcolor="#F0F0F0" style="font-family: Helvetica, arial, sans-serif; font-size: 18px; color: ${config.configMail.colors.primary}; text-align:center;">
                                                    <td style="padding: 10px;" width="200px">
                                                        Producto
                                                    </td>
                                                    <td style="padding: 10px;" width="110px">
                                                        Precio
                                                    </td>
                                                    <td style="padding: 10px;" width="60px">
                                                        Cant
                                                    </td>
                                                    <td style="padding: 10px;" width="70px">
                                                        IVA
                                                    </td>
                                                    <td style="padding: 10px;" width="120px">
                                                        SubTtl
                                                    </td>
                                                </tr>
                                                <!-- end of title -->
                                                <!-- content -->
      `;
    let baseImponible = 0;
    let ivaTtl = 0;
    let totalGrl = 0;
    cotiza.products.map(
      (item: {
        price: number;
        amount: number;
        iva?: boolean;
        name: string;
      }) => {
      const precio = item.price * item.amount;
      let iva = 0;
      let total = 0;
      if (item.iva) {
        iva = precio * (cotiza.iva / 100);
        baseImponible += precio;
        ivaTtl += iva;
      }
      total = precio + iva;
      totalGrl += precio;

      tabla += `
        <tr style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: #4f5458; text-align:left; line-height: 20px;">
            <td style="padding: 5px;">
                ${item.name}
            </td>
            <td style="padding: 5px; text-align: right;">
                ${numFormat(item.price)}
            </td>
            <td style="padding: 5px; text-align: center;">
                ${item.amount}
            </td>
            <td style="padding: 5px; text-align: right;">
                ${numFormat(iva)}
            </td>
            <td style="padding: 5px; text-align: right;">
                ${numFormat(total)}
            </td>
        </tr>
        `;
    });

    tabla += `
    <tr bgcolor="#F0F0F0" style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: #4f5458; text-align:left; line-height: 20px;">
        <td colspan="4" style="padding: 5px; text-align: right;">
            Base Imponible
        </td>
        <td style="padding: 5px; text-align: right;">
            ${numFormat(baseImponible)}
        </td>
    </tr>
    `;

    tabla += `
    <tr bgcolor="#F0F0F0" style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: #4f5458; text-align:left; line-height: 20px;">
        <td colspan="4" style="padding: 5px; text-align: right;">
            Subtotal
        </td>
        <td style="padding: 5px; text-align: right;">
            ${numFormat(totalGrl)}
        </td>
    </tr>
    `;

    tabla += `
    <tr bgcolor="#F0F0F0" style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: #4f5458; text-align:left; line-height: 20px;">
        <td colspan="4" style="padding: 5px; text-align: right;">
            Iva
        </td>
        <td style="padding: 5px; text-align: right;">
            ${numFormat(ivaTtl)}
        </td>
    </tr>
    `;

    const precioTtl = totalGrl + ivaTtl;

    tabla += `
    <tr bgcolor="#F0F0F0" style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: '.$color['ppl'].'; text-align:left; line-height: 20px;">
        <td colspan="4" style="padding: 5px; text-align: right;">
            Total
        </td>
        <td style="padding: 5px; text-align: right;">
            ${numFormat(precioTtl)}
        </td>
    </tr>
    `;

    tabla += `
    <!-- end of content -->
                                            </tbody>
                                            
                                        </table>
                                    </td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td height="20"></td>
                                </tr>
                                <!-- Spacing -->
                                <!-- bottom-border -->
                                <tr>
                                    <td width="100%" bgcolor="'.$color['ppl'].'" height="3" style="font-size: 1px; line-height: 1px;">&nbsp;</td>
                                </tr>
                                <!-- /bottom-border -->
                            </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- end of Presupuesto -->
    `;

    body += tabla;
  }

  body += `
    ${separator}
    <!-- footer -->
    <table width="100%" bgcolor="${config.configMail.colors.primary}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable">
    <tbody>
        <tr>
            <td>
                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                <tbody>
                    <tr>
                        <td width="100%">
                            <table bgcolor="${config.configMail.colors.primary}" width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                            <tbody>
                                <tr>
                                    <td>
                                        <table width="290" align="left" border="0" cellpadding="0" cellspacing="0" class="devicewidth">
                                        <tbody>
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="20"></td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td style="font-family: Helvetica, arial, sans-serif; font-size: 18px; color: #ffffff; text-align:left;">
                                                    
                                                </td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="10"></td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: #ffffff; text-align:left;">
                                                    
                                                </td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="10"></td>
                                            </tr>
                                            <!-- Spacing -->
                                        </tbody>
                                        </table>
                                        <!-- end of left column -->
                                        <!-- start of right column -->
                                        <table width="200" align="right" border="0" cellpadding="0" cellspacing="0" class="devicewidth">
                                        <tbody>
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="20"></td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td style="font-family: Helvetica, arial, sans-serif; font-size: 18px; color: ${config.configMail.colors.title}; text-align:left;">
                                                    Contactos
                                                </td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="10"></td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td style="font-family: Helvetica, arial, sans-serif; font-size: 14px; color: ${config.configMail.colors.title}; text-align:left;">
                                                ${config.phone}<br />
                                                <a href="mailto:${config.email}" style="text-decoration: none; color: ${config.configMail.colors.secundary}">${config.email}</a>
                                                </td>
                                            </tr>
                                            <!-- Spacing -->
                                            <tr>
                                                <td width="100%" height="20"></td>
                                            </tr>
                                            <!-- Spacing -->
                                        </tbody>
                                        </table>
                                        <!-- end of right column -->
                                    </td>
                                </tr>
                            </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- end of footer -->
    <!-- Start of Postfooter -->
    <table width="100%" bgcolor="${config.configMail.colors.background}" cellpadding="0" cellspacing="0" border="0" id="backgroundTable" st-sortable="postfooter" >
    <tbody>
        <tr>
            <td>
                <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                <tbody>
                    <tr>
                        <td width="100%">
                            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" class="devicewidth">
                            <tbody>
                                <!-- Spacing -->
                                <tr>
                                    <td width="100%" height="20"></td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td align="center" valign="middle" style="font-family: Helvetica, arial, sans-serif; font-size: 13px;color: #ffffff" st-content="preheader">
                                        Dont want to receive email Updates? <a href="#" style="text-decoration: none; color: ${config.configMail.colors.primary}">Unsubscribe here </a> 
                                    </td>
                                </tr>
                                <!-- Spacing -->
                                <tr>
                                    <td width="100%" height="20"></td>
                                </tr>
                                <!-- Spacing -->
                            </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
                </table>
            </td>
        </tr>
    </tbody>
    </table>
    <!-- End of postfooter -->   
    </body>
    </html>
    `;

  return body;
};
