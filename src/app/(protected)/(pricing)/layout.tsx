import { AutumnWrapper } from "../_components/autumn-wrapper"

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AutumnWrapper>
            {children}
        </AutumnWrapper>
    )
}