import { GrDocumentTest } from "react-icons/gr";
import { MdOutlineMarkEmailRead } from "react-icons/md";
const TestIcon = GrDocumentTest as React.FC;
const MailIcon = MdOutlineMarkEmailRead as React.FC;

type MailLog = {
    id: number;
    partnerId: number;
    created_at: string;
    data: {
        accepted: string[];
        rejected: string[];
        response: string;
        test_mode: number;
        envelope: {
            from: string;
            to: string[];
        };
    };
};

const thStyle = {
    padding: "10px",
    fontWeight: 600,
};

const tdStyle = {
    padding: "10px",
    verticalAlign: "middle",
};

interface MailLogsProps {
    mailLogs: MailLog[]
}




const MailLogs: React.FC<MailLogsProps> = ({ mailLogs }) => {
    
    return (
        <div>



            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                }}
            >
                <thead>
                    <tr
                        style={{
                            textAlign: "left",
                            background: "#f5f5f5",
                            borderBottom: "2px solid #ddd",
                        }}
                    >

                        <th style={thStyle}>Type</th>
                        <th style={thStyle}>Accepted Recipient</th>
                        <th style={thStyle}>Created At</th>
                        <th style={thStyle}>Response</th>
                        <th style={thStyle}>From</th>
                        <th style={thStyle}>To</th>
                    </tr>
                </thead>

                <tbody>
                    {!mailLogs || mailLogs.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                style={{
                                    textAlign: "center",
                                    padding: "20px",
                                    color: "#888",
                                }}
                            >
                                No email logs found
                            </td>
                        </tr>
                    ) : (
                        mailLogs.map((log, index) => (
                            <tr
                                key={log.id}
                                style={{
                                    borderBottom: "1px solid #eee",
                                    background: index % 2 === 0 ? "#fff" : "#fafafa",
                                }}
                            >
                                {/* Accepted Recipient */}
                                <td style={tdStyle}>
                                    {Number(log.data?.test_mode) === 1? <MailIcon /> : <TestIcon/>}
                                </td>

                                <td style={tdStyle}>
                                    {log.data?.accepted?.join(", ") || "-"}
                                </td>

                                {/* Created At */}
                                <td style={tdStyle}>
                                    {new Date(log.created_at).toLocaleString()}
                                </td>

                                {/* Response */}
                                <td style={tdStyle}>
                                    {log.data?.response || "-"}
                                </td>

                                {/* From */}
                                <td style={tdStyle}>
                                    {log.data?.envelope?.from || "-"}
                                </td>

                                {/* To */}
                                <td style={tdStyle}>
                                    {log.data?.envelope?.to?.join(", ") || "-"}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default MailLogs;