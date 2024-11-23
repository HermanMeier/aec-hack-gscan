import './App.css'
import "neuroglancer";
import SliceView from "./views/SliceView.tsx";

function App() {

    return (
        <div className="relative w-full h-screen">
            <SliceView/>
        </div>
    );
}

export default App;