import logo from '@/assets/image 2.png';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-3">
            <img
                src={logo}
                alt="AISAT Logo"
                className="h-10 w-10 object-contain"
            />

            <div className="ml-2 grid flex-1 text-left text-base">
                <span className="truncate leading-snug font-bold text-lg">
                    AISAT Scheduler
                </span>
            </div>
        </div>
    );
}
