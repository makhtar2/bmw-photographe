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
  switch (name) {
    case "person":
      return <User className={className} />;
    case "phone":
    case "call":
      return <Phone className={className} />;
    case "photo_camera":
      return <Camera className={className} />;
    case "home":
      return <Home className={className} />;
    case "favorite":
      return <Heart className={className} />;
    case "layers":
      return <Layers className={className} />;
    case "keyboard_arrow_down":
      return <ChevronDown className={className} />;
    case "check_circle":
      return <CheckCircle2 className={className} />;
    case "event":
    case "calendar_month":
      return <Calendar className={className} />;
    case "schedule":
      return <Clock className={className} />;
    case "close":
      return <X className={className} />;
    case "share":
      return <Share2 className={className} />;
    case "download":
      return <Download className={className} />;
    case "place":
      return <MapPin className={className} />;
    case "chat":
      return <MessageCircle className={className} />;
    case "grid_view":
      return <LayoutGrid className={className} />;
    default:
      return <Camera className={className} />;
  }
}



