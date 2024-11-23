import './App.css'
import "neuroglancer";
import {createBrowserRouter, RouterProvider,} from "react-router";
import SliceView from "./views/SliceView.tsx";

function App() {

    const router = createBrowserRouter([
        {
            path: "/",
            element: <SliceView/>,
        },
    ]);

    return (
        <>
            <RouterProvider router={router}/>
        </>
    )
}

export default App
