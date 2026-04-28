    // Create styles
    import { StyleSheet } from "@react-pdf/renderer";
    const styles = StyleSheet.create({
        page: {
            flexDirection: "column",
            backgroundColor: "#fff",
            flex: 1,
        },
        section: {
            margin: 10,
            padding: 10,
        },
        headerBar: {
            backgroundColor: "#886D39",
            height: 35,
            justifyContent: "center",
            alignItems: "center",
            paddingLeft: 170,
            zIndex: 1,
        },
        headerBarSmall: {
            height: 17,
            marginTop: 2,
        },
        headerTextBig: {
            fontFamily: "Times-Roman",
            fontSize: 15,
            color: "#fff",
        },
        headerTextSmall: {
            fontWeight: "extrabold",
            fontSize: 10,
            color: "#fff",
        },
        headerLogoContainer: {
            backgroundColor: "white",
            borderRadius: 100,
            width: 150,
            height: 150,
            position: "absolute",
            zIndex: -1,
            marginLeft: 30,
            top: -50,
        },
        notes: {
            paddingLeft: 170,
            color: "red",
            fontSize: 5,
            marginVertical: 8,
        },
        notesContainer: {
            alignItems: "center",
            marginVertical: 3,
        },
        title: {
            backgroundColor: "#886D39",
            height: 17,
            padding: 2,
            paddingLeft: 10,
        },
        contentBody: {
            fontSize: 10,
        },
        textField: {
            // backgroundColor: "#eee",
            // backgroundColor: "#000",
            padding: 3,
            height: 20,
            marginTop: 4,
            position: "absolute",
            fontSize: 8,
        },
        container: {
            flex: 1,
            backgroundColor: "#fff",
            position: "relative",
        },
        template: {},
        formOverlay: {
            position: "absolute",
            width: "100%",
            height: "100%",
        },
        templateRow: {
            position: "absolute",
            left: 14,
            right: 14,
            flexDirection: "row",
            paddingHorizontal: 14,
            backgroundColor: "green",
        },
        checkbox: {
            backgroundColor: "white",
            width: 10,
            height: 11,
            position: "absolute",
        },
    });


    export default styles;