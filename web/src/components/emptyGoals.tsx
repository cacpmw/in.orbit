import { DialogTrigger } from "./ui/dialog";
import logo from "../assets/logo-in-orbit.svg";
import letsStart from "../assets/lets-start.svg";
import { Plus } from "lucide-react";

export function EmptyGoals() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-8">
      <img src={logo} alt="in.orbit logo" />
      <img src={letsStart} alt="in.orbit lets start illustration" />
      <p className="text-zinc-300 leading-relaxed max-w-80 text-center">
        Você ainda não cadastrou nenhuma meta, que tal cadastrar um agora mesmo?
      </p>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-violet-500
         text-violet-50
         px-4 py-2.5
         rounded-lg
         flex
         gap-2
         items-center
         text-sm
         font-medium
         tracking-tight
         hover:bg-violet-600"
        >
          <Plus className="size-4" />
          Cadastrar meta
        </button>
      </DialogTrigger>
    </div>
  );
}
