import { Github, Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-auto py-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 footer-content text-center">
        <div className="flex justify-center space-x-6 mb-4">
          <a
            href="https://peterburzaportfolio.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-sm font-medium cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            Portfolio
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-sm font-medium cursor-pointer"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Nutri-Pal &bull; Peter Burza
        </p>
      </div>
    </footer>
  )
}
