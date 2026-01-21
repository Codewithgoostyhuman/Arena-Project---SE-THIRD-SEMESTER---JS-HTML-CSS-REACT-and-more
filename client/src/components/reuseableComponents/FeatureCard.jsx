export default function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex justify-center mb-4 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-center mb-2 text-white group-hover:text-indigo-200 transition-colors">{title}</h3>
            <p className="text-slate-400 text-center leading-relaxed">{description}</p>
        </div>
    );
}