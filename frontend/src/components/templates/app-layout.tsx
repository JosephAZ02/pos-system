import {Outlet} from "react-router-dom";
import SideBar from "../utils/side-bar";

function AppLayout() {
    return (
        <div className="d-flex min-vh-100">
            <SideBar/>
            <main className="flex-grow-1 p-4 bg-body">
                <Outlet/>
            </main>
        </div>
    );
}

export default AppLayout;