import {
    PDFViewer,
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";
import { Html } from "react-pdf-html";

import moment from "moment";
import styles from "./styles";


interface OfferPDFPage2Props {
  partner: any;
  selectedPremiumEn: any;
  isHotpick: boolean;
  productNameEn: string;
  freebieEn: string;
  freebieValue: number | string;
  selectedCategory: any;
  startDate: Date | string | Date[];
  endDate: Date | string | Date[];
  highlightsEn: string;
  finePrintsEn: string;
  export_template: string;
}

const OfferPDFPage2: React.FC<OfferPDFPage2Props> = ({
  partner,
  selectedPremiumEn,
  isHotpick,
  productNameEn,
  freebieEn,
  freebieValue,
  selectedCategory,
  startDate,
  endDate,
  highlightsEn,
  finePrintsEn,
  export_template,
}) => (
        <Document>
            <Page size={"A4"} style={styles.page}>
                <View style={styles.container}>
                    <Image
                        style={styles.template}
                        src={export_template}
                        source={export_template}
                    />
                    <View style={styles.formOverlay}>
                        <View style={[styles.templateRow, { top: 115 }]}>
                            <View style={[styles.textField, { width: 375 }]}>
                                {/* Partner/Outlet name */}
                                <Text>{`${partner ? partner.title : ""}${partner &&
                                    (partner.main_branch != undefined
                                        ? ` -- ${partner.main_branch}`
                                        : "")
                                    }`}</Text>
                            </View>

                            {/* Partner/Outlet Category */}
                            <View style={[styles.textField, { right: 0, width: 186 }]}>
                                <Text>{partner.pcategory_en || ""}</Text>
                            </View>
                        </View>
                        <View style={[styles.templateRow, { top: 173 }]}>
                            {/* checkbox: premium discount */}
                            {selectedPremiumEn && selectedPremiumEn.type != 0 && (
                                <View style={[styles.checkbox, { top: 7, left: 2 }]}></View>
                            )}

                            {/* Premium Discount */}
                            <View style={[styles.textField, { left: 18, width: 250 }]}>
                                <Text>
                                    {selectedPremiumEn &&
                                        selectedPremiumEn.type == 0 &&
                                        selectedPremiumEn
                                        ? selectedPremiumEn.premium_en
                                        : ""}
                                </Text>
                            </View>

                            {/* checkbox: premium special offer */}
                            {selectedPremiumEn && selectedPremiumEn.type != 1 && (
                                <View style={[styles.checkbox, { top: 7, left: 278 }]}></View>
                            )}

                            {/* Premium Special Offer */}
                            <View style={[styles.textField, { left: 294, width: 250 }]}>
                                <Text>
                                    {selectedPremiumEn &&
                                        selectedPremiumEn.type == 1 &&
                                        selectedPremiumEn
                                        ? selectedPremiumEn.premium_en
                                        : ""}
                                </Text>
                            </View>

                            {/* checkbox: free */}
                            {selectedPremiumEn && selectedPremiumEn.type != 2 && (
                                <View style={[styles.checkbox, { top: 7, right: 3 }]}></View>
                            )}

                            {/* checkbox: hotpick */}
                            {!isHotpick && (
                                <View
                                    style={[
                                        styles.checkbox,
                                        { top: -26, height: 12, width: 11, right: 3 },
                                    ]}
                                ></View>
                            )}
                        </View>
                        <View style={[styles.templateRow, { top: 200 }]}>
                            {/* Product Service Name */}
                            <View style={[styles.textField, { width: 567 }]}>
                                <Text>{productNameEn}</Text>
                            </View>
                        </View>
                        <View style={[styles.templateRow, { top: 230 }]}>
                            {/* Freebie Name */}
                            <View style={[styles.textField, { width: 460 }]}>
                                <Text>{freebieEn || "N/A"}</Text>
                            </View>
                            {/* Freebie Value */}
                            <View style={[styles.textField, { width: 100, right: 0 }]}>
                                <Text>{freebieValue || "N/A"}</Text>
                            </View>
                        </View>
                        <View style={[styles.templateRow, { top: 264 }]}>
                            {/* Offer Category */}
                            <View style={[styles.textField, { width: 185 }]}>
                                <Text>
                                    {selectedCategory ? selectedCategory.category_en : ""}
                                </Text>
                            </View>
                            {/* Start Date */}
                            <View style={[styles.textField, { width: 185, left: 191 }]}>
                                <Text>
                                    {moment(new Date(startDate.toString())).format("LL")}
                                </Text>
                            </View>
                            {/* End Date */}
                            <View style={[styles.textField, { width: 186, right: 0 }]}>
                                <Text>{moment(new Date(endDate.toString())).format("LL")}</Text>
                            </View>
                        </View>
                        <View style={[styles.templateRow, { top: 292 }]}>
                            <View style={[styles.textField, { width: 567, height: 210 }]}>
                                {/* <Text>{highlightsEn || ""}</Text> */}
                                <Html>{`
                            <html>
                            <style>
                                body {
                                    font-size: 8px;
                                }
                                ul {
                                    margin: 0px;
                                }
                                p {
                                    margin: 0;
                                    padding: 0;
                                }
                            </style>
                                <body style="font-size: 8px;"> 
                                    ${highlightsEn
                                        .replaceAll("<p>", "")
                                        .replaceAll("</p>", "<br><br>") || ""
                                    }
                                
                                </body>
                            </html>
                            `}</Html>
                            </View>
                        </View>
                        <View style={[styles.templateRow, { top: 518 }]}>
                            <View style={[styles.textField, { width: 567, height: 210 }]}>
                                <Html>{`
                                <html>
                                <style>
                                    body {
                                        font-size: 8px;
                                    }
                                    ul {
                                        margin: 0px;
                                    }
                                    p {
                                        margin: 0;
                                        padding: 0;
                                    }
                                </style>
                                    <body style="font-size: 8px;"> 
                                        ${finePrintsEn
                                        .replaceAll("<p>", "")
                                        .replaceAll("</p>", "<br><br>") ||
                                    ""
                                    }
                                    
                                    </body>
                                </html>
                                `}</Html>
                            </View>
                        </View>
                        {/* <View style={[styles.textField, {top: 115, left: 14, width: 375, height: 20}]}>
                        <Text>hello</Text>
                    </View>
                    <View style={[styles.textField, {top: 115, left: 14, width: 375, height: 20}]}>
                        <Text>hello</Text>
                    </View> */}
                    </View>
                </View>
            </Page>
        </Document>
    );


    export default OfferPDFPage2;