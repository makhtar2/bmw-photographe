import React from "react";
import { 
  User, 
  Phone, 
  Camera, 
  Home, 
  Heart, 
  Layers, 
  ChevronDown, 
  CheckCircle2, 
  Calendar, 
  X, 
  Share2, 
  Download, 
  MapPin, 
  MessageCircle,
  Clock,
  LayoutGrid
} from "lucide-react";

interface MaterialIconProps {
  name: string;
  className?: string;
}

export default function MaterialIcon({ name, className = "" }: MaterialIconProps) {
  const iconClass = `shrink-0 ${className}`;
  switch (name) {
    case "person":
      return <User className={iconClass} />;
    case "phone":
    case "call":
      return <Phone className={iconClass} />;
    case "photo_camera":
      return <Camera className={iconClass} />;
    case "home":
      return <Home className={iconClass} />;
    case "favorite":
      return <Heart className={iconClass} />;
    case "layers":
      return <Layers className={iconClass} />;
    case "keyboard_arrow_down":
      return <ChevronDown className={iconClass} />;
    case "check_circle":
      return <CheckCircle2 className={iconClass} />;
    case "event":
    case "calendar_month":
      return <Calendar className={iconClass} />;
    case "schedule":
      return <Clock className={iconClass} />;
    case "close":
      return <X className={iconClass} />;
    case "share":
      return <Share2 className={iconClass} />;
    case "download":
      return <Download className={iconClass} />;
    case "place":
      return <MapPin className={iconClass} />;
    case "chat":
      return <MessageCircle className={iconClass} />;
    case "grid_view":
      return <LayoutGrid className={iconClass} />;
    default:
      return <Camera className={iconClass} />;
  }
}



