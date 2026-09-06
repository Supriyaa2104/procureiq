import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./Layout.css";

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <TopBar title={title} subtitle={subtitle} />
        {children}
      </main>
    </div>
  );
}