import { drawSketchCircle, drawSketchLine, drawSketchPolyline, hash1D } from './sketchDraw';
import type { CharacterId } from './characters';

export type WeaponType = 'short' | 'medium' | 'long' | 'heavy' | 'shield';
export type PrimaryWeaponType = Exclude<WeaponType, 'shield'>;
export type WeaponStyle = 'standard' | CharacterId;

export interface WeaponDef {
  id: WeaponType;
  name: string;
  trait: string;
  length: number;
  lightDamage: number;
  heavyDamage: number;
  extraReach: number;
  knockbackX: number;
  knockbackY: number;
  cooldownMult: number;
  blockPenetration: number; // fraction of damage passing through block
  hitstop: number;
  shake: number;
  heavyOverride: boolean;
  callouts: string[];
  color: string;
}

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  short: {
    id: 'short',
    name: 'Cận ngắn',
    trait: 'Nhanh · Rỉa đòn',
    length: 30,
    lightDamage: 9,
    heavyDamage: 15,
    extraReach: 14,
    knockbackX: 165,
    knockbackY: -80,
    cooldownMult: 0.78,
    blockPenetration: 0.18,
    hitstop: 0.022,
    shake: 2.8,
    heavyOverride: false,
    callouts: ['XOẸT!', 'CHÍCH!', 'LẸ!'],
    color: '#0F172A',
  },
  medium: {
    id: 'medium',
    name: 'Tầm trung',
    trait: 'Linh hoạt · Văng',
    length: 48,
    lightDamage: 11,
    heavyDamage: 19,
    extraReach: 24,
    knockbackX: 290,
    knockbackY: -155,
    cooldownMult: 0.9,
    blockPenetration: 0.24,
    hitstop: 0.036,
    shake: 4.5,
    heavyOverride: true,
    callouts: ['XOẠC!', 'CỐP!', 'BỐP!'],
    color: '#334155',
  },
  long: {
    id: 'long',
    name: 'Cán dài',
    trait: 'Đâm xa · Ghim',
    length: 68,
    lightDamage: 12,
    heavyDamage: 20,
    extraReach: 48,
    knockbackX: 265,
    knockbackY: -80,
    cooldownMult: 0.88,
    blockPenetration: 0.58,
    hitstop: 0.032,
    shake: 4.0,
    heavyOverride: false,
    callouts: ['PHẬP!', 'CHỌC!', 'XUYÊN!'],
    color: '#475569',
  },
  heavy: {
    id: 'heavy',
    name: 'Hạng nặng',
    trait: 'Cực mạnh · Xé giấy',
    length: 48,
    lightDamage: 18,
    heavyDamage: 33,
    extraReach: 24,
    knockbackX: 430,
    knockbackY: -200,
    cooldownMult: 1.26,
    blockPenetration: 0.45,
    hitstop: 0.072,
    shake: 10.5,
    heavyOverride: true,
    callouts: ['RẦM!', 'BÙM!', 'NÁT!'],
    color: '#334155',
  },
  shield: {
    id: 'shield',
    name: 'Phòng thủ',
    trait: 'Chắn · Ném',
    length: 28,
    lightDamage: 8,
    heavyDamage: 12,
    extraReach: 10,
    knockbackX: 260,
    knockbackY: -80,
    cooldownMult: 1,
    blockPenetration: 0.2,
    hitstop: 0.03,
    shake: 4,
    heavyOverride: false,
    callouts: ['KENG!', 'ĐỠ!', 'CHẮN!'],
    color: '#1E3A8A',
  },
};

export const WEAPON_REACH: Record<WeaponType | 'unarmed', number> = {
  unarmed: 62,
  shield: 65,
  short: 74,
  medium: 92,
  heavy: 90,
  long: 114,
};

export const WEAPON_LIST: WeaponDef[] = [
  WEAPONS.short,
  WEAPONS.medium,
  WEAPONS.long,
  WEAPONS.heavy,
  WEAPONS.shield,
];

const CHARACTER_WEAPON_MAP: Partial<Record<CharacterId, Record<WeaponType, { name: string; note: string }>>> = {
  nhoc: {
    short: { name: 'Dao rọc giấy', note: 'Nhẹ gọn vừa tay Nhóc, chém rỉa liên hoàn cực lẹ.' },
    medium: { name: 'Thước gỗ sứt mẻ', note: 'Thước học sinh vung bằng hai tay, quật nảy vui nhộn.' },
    long: { name: 'Chổi lau nhà dài', note: 'Cán chổi dài quá khổ, Nhóc xoay mình giữ khoảng cách khéo.' },
    heavy: { name: 'Búa hơi khổng lồ', note: 'To bằng cả người Nhóc — vung cực ì ạch, hay mất đà hở sườn!' },
    shield: { name: 'Nắp cặp sách', note: 'Nắp cặp che gần nửa thân nhỏ, nặng tay khó xoay xở.' },
  },
  bucon: {
    short: { name: 'Dao phay đồ tể', note: 'Lưỡi phay nhỏ so với nắm đấm to, tầm ngắn dễ hụt nhịp.' },
    medium: { name: 'Ống tuýp sắt', note: 'Đập thô bạo thẳng tay, thiếu độ linh hoạt chuyển nhịp.' },
    long: { name: 'Xà beng dài', note: 'Thân nặng nề không hợp đâm tỉa, đòn chọc bị vướng nhịp.' },
    heavy: { name: 'Tảng bê tông cốt thép', note: 'Sở trường hủy diệt: vung nặng xé giấy, giậm đất rung trang.' },
    shield: { name: 'Cánh cửa sắt rỉ', note: 'Tấm thép dày chặn đứng đòn thường, ép góc không lùi.' },
  },
  caokieu: {
    short: { name: 'Compa nhọn', note: 'Quá ngắn với sải tay dài, phải cúi sát vào vùng chết.' },
    medium: { name: 'Thước chữ T', note: 'Vừa tầm trung giữ nhịp, quất ngang đẩy lùi gọn.' },
    long: { name: 'Cần câu tre', note: 'Sở trường trứ danh: sải tay + cần tre chạm đúng tầm ngọt từ xa.' },
    heavy: { name: 'Tạ đòn dài', note: 'Thân gầy yếu không tải nổi đầu tạ nặng, chao đảo mất thăng bằng.' },
    shield: { name: 'Tấm ván gỗ cao', note: 'Vướng víu sải tay dài, khó đỡ kín thân cao.' },
  },
  lonsat: {
    short: { name: 'Mỏ hàn nhiệt', note: 'Ngắn và khớp tay thô khiến mỏ hàn hay khựng giữa nhịp.' },
    medium: { name: 'Cờ lê dẹt', note: 'Vung ổn định theo nhịp cơ khí, đủ lực đẩy đối thủ.' },
    long: { name: 'Ống xả dài', note: 'Cồng kềnh dễ kẹt khớp nồi hơi, khó đâm tỉa chính xác.' },
    heavy: { name: 'Cờ lê khổng lồ', note: 'Khớp thép siết chặt đầu ngàm nặng, quật vang rền mặt giấy.' },
    shield: { name: 'Nắp nồi sắt', note: 'Vỏ thép đồng bộ giáp nồi hơi, chắn đòn chắc nịch.' },
  },
  hebongbay: {
    short: { name: 'Dao phóng xiếc', note: 'Múa dao tung hứng lanh lẹ, rỉa nhẹ mở cơ hội tung trò.' },
    medium: { name: 'Kiếm bóng bay', note: 'Sở trường rạp xiếc: vung dẻo dai nối đòn chốt thả đạo cụ.' },
    long: { name: 'Giáo cờ BANG!', note: 'Cán cờ dài lủng lẳng dễ vướng chân khi nhảy nhót.' },
    heavy: { name: 'Búa cao su kêu chít', note: 'Đầu búa to nảy tưng vừa sức, gõ nhịp hài hước.' },
    shield: { name: 'Mâm bưng bạc', note: 'Dễ tuột tay khi nhào lộn, dùng ném nhiều hơn đỡ.' },
  },
  ninja: {
    short: { name: 'Kunai buộc dây', note: 'Sở trường sát thủ: chớp nhoáng 4 nhịp rỉa máu cực hiểm.' },
    medium: { name: 'Katana mực đen', note: 'Sở trường trứ danh: chém xé gió sắc lẹm và lướt tới cực bén.' },
    long: { name: 'Naginata', note: 'Xoay cán dài dẻo tay, kiểm soát khoảng cách ổn.' },
    heavy: { name: 'Chùy gai tetsubo', note: 'Quá nặng phá vỡ thân pháp nhẹ của Ninja, vung chậm hở sườn.' },
    shield: { name: 'Khiên bát giác đen', note: 'Khiên nặng làm chậm bước nhảy thoát góc đặc trưng.' },
  },
  kysilon: {
    short: { name: 'Dao găm giáp sĩ', note: 'Ngồi trên lưng heo khó với xuống cận chiến quá gần.' },
    medium: { name: 'Kiếm kỵ sĩ', note: 'Vung chém gọn gàng từ yên heo, áp lực đều tuyến đầu.' },
    long: { name: 'Thương kỵ binh', note: 'Sở trường xung phong: mũi thương dài ghim đối thủ từ xa.' },
    heavy: { name: 'Rìu chiến hai lưỡi', note: 'Bổ rìu uy lực trên đà lợn lao tới, sức nặng đáng gờm.' },
    shield: { name: 'Khiên gia huy heo', note: 'Sở trường hộ thân: chắn vững trên lưng lợn giữ tuyến đầu.' },
  },
  nguoisoi: {
    short: { name: 'Móng vuốt xương', note: 'Sở trường hoang dại: chém xé dồn dập tích nhanh thanh trăng.' },
    medium: { name: 'Xích đao gỉ sét', note: 'Chém ngang dữ dội lúc chưa hóa sói, dễ nối chuỗi.' },
    long: { name: 'Cọc săn sói', note: 'Cầm cọc gỗ vướng tay gầm gừ, không hợp bản năng vồ.' },
    heavy: { name: 'Đá ngục xích sắt', note: 'Quật khối đá ngục nặng nề đầy bạo lực lúc giữ thế.' },
    shield: { name: 'Khiên gỗ trầy xước', note: 'Chướng mắt bản năng thú dữ, đỡ thiếu tập trung.' },
  },
};

export function getCharacterWeaponInfo(
  style: WeaponStyle,
  type: WeaponType,
): { name: string; note: string } {
  if (style !== 'standard') {
    const custom = CHARACTER_WEAPON_MAP[style]?.[type];
    if (custom) return custom;
  }
  const base = WEAPONS[type];
  const fallbackNames: Record<WeaponType, string> = {
    short: 'Dao găm mực',
    medium: 'Kiếm mực',
    long: 'Giáo dài',
    heavy: 'Búa tạ',
    shield: 'Khiên gỗ',
  };
  return {
    name: fallbackNames[type],
    note: base.trait,
  };
}

export function drawHeldShield(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facing: 1 | -1,
  crouching: boolean,
  scale: number,
  seed: number,
  style: WeaponStyle = 'standard',
) {
  const r = (crouching ? 19.5 : 16) * scale;
  const x = cx + facing * (crouching ? 6 : 3) * scale;
  const y = cy + (crouching ? -2 : 0) * scale;

  if (style === 'hebongbay') {
    // Waiter serving tray ("mâm bưng bạc")
    drawSketchCircle(ctx, x, y, r * 1.04, {
      color: '#334155',
      lineWidth: 2.5 * scale,
      roughness: 0.75,
      seed: seed + 1,
      passes: 2,
      alpha: 0.96,
    });
    drawSketchCircle(ctx, x, y, r * 0.78, {
      color: '#94A3B8',
      lineWidth: 1.5 * scale,
      roughness: 0.5,
      seed: seed + 2,
      passes: 1,
      alpha: 0.85,
    });
    ctx.save();
    ctx.fillStyle = 'rgba(254, 249, 195, 0.85)';
    ctx.beginPath();
    ctx.arc(x + facing * 1.5 * scale, y, 5.2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawSketchCircle(ctx, x + facing * 1.5 * scale, y, 5.2 * scale, {
      color: '#F59E0B',
      lineWidth: 1.6 * scale,
      roughness: 0.5,
      seed: seed + 5,
      passes: 1,
    });
    return;
  }

  if (style === 'lonsat') {
    // Iron pot-lid ("nắp nồi sắt")
    drawSketchCircle(ctx, x, y, r * 1.02, {
      color: '#334155',
      lineWidth: 2.7 * scale,
      roughness: 0.75,
      seed: seed + 1,
      passes: 2,
      alpha: 0.96,
    });
    drawSketchCircle(ctx, x, y, r * 0.72, {
      color: '#64748B',
      lineWidth: 1.6 * scale,
      roughness: 0.55,
      seed: seed + 2,
      passes: 1,
      alpha: 0.85,
    });
    drawSketchLine(ctx, x - r * 0.42, y - r * 0.36, x + r * 0.18, y - r * 0.48, {
      color: '#94A3B8',
      lineWidth: 1.5 * scale,
      roughness: 0.3,
      seed: seed + 3,
      passes: 1,
      alpha: 0.75,
    });
    ctx.save();
    ctx.fillStyle = '#334155';
    for (let ri = 0; ri < 4; ri++) {
      const a = (Math.PI * 2 * ri) / 4 + 0.4;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    drawSketchCircle(ctx, x + facing * 2.5 * scale, y, 4.4 * scale, {
      color: '#1E293B',
      lineWidth: 2.3 * scale,
      roughness: 0.4,
      seed: seed + 5,
      passes: 2,
    });
    return;
  }

  if (style === 'nhoc') {
    // Schoolbag flap ("nắp cặp sách") with buckle straps
    const w = r * 1.15;
    const h = r * 0.95;
    const pts = [
      { x: x - w, y: y - h },
      { x: x + w, y: y - h },
      { x: x + w * 0.9, y: y + h * 0.7 },
      { x: x, y: y + h * 1.05 },
      { x: x - w * 0.9, y: y + h * 0.7 },
      { x: x - w, y: y - h },
    ];
    ctx.save();
    ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchPolyline(ctx, pts, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.85, seed: seed + 1, passes: 2 });
    drawSketchLine(ctx, x - w * 0.45, y - h * 0.7, x - w * 0.45, y + h * 0.45, { color: '#EA580C', lineWidth: 2 * scale, roughness: 0.4, seed: seed + 2, passes: 1 });
    drawSketchLine(ctx, x + w * 0.45, y - h * 0.7, x + w * 0.45, y + h * 0.45, { color: '#EA580C', lineWidth: 2 * scale, roughness: 0.4, seed: seed + 3, passes: 1 });
    return;
  }

  if (style === 'bucon') {
    // Rusted iron door ("cánh cửa sắt rỉ")
    const w = r * 0.9;
    const h = r * 1.25;
    const pts = [
      { x: x - w, y: y - h },
      { x: x + w, y: y - h },
      { x: x + w, y: y + h },
      { x: x - w, y: y + h },
      { x: x - w, y: y - h },
    ];
    ctx.save();
    ctx.fillStyle = 'rgba(100, 116, 139, 0.26)';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchPolyline(ctx, pts, { color: '#1E293B', lineWidth: 2.9 * scale, roughness: 0.9, seed: seed + 1, passes: 2 });
    drawSketchLine(ctx, x - w * 0.65, y - h * 0.55, x + w * 0.65, y + h * 0.55, { color: '#9A3412', lineWidth: 2 * scale, roughness: 0.7, seed: seed + 2, passes: 1 });
    drawSketchCircle(ctx, x + facing * w * 0.45, y, 2.5 * scale, { color: '#B45309', lineWidth: 1.8 * scale, roughness: 0.4, seed: seed + 3, passes: 1 });
    return;
  }

  if (style === 'caokieu') {
    // Tall wooden drafting board ("tấm ván gỗ cao")
    const w = r * 0.56;
    const h = r * 1.38;
    const pts = [
      { x: x - w, y: y - h },
      { x: x + w, y: y - h },
      { x: x + w, y: y + h },
      { x: x - w, y: y + h },
      { x: x - w, y: y - h },
    ];
    drawSketchPolyline(ctx, pts, { color: '#78350F', lineWidth: 2.3 * scale, roughness: 0.85, seed: seed + 1, passes: 2 });
    drawSketchLine(ctx, x, y - h * 0.8, x, y + h * 0.8, { color: '#92400E', lineWidth: 1.5 * scale, roughness: 0.6, seed: seed + 2, passes: 1, alpha: 0.75 });
    drawSketchLine(ctx, x - w * 0.7, y, x + w * 0.7, y, { color: '#16A34A', lineWidth: 1.6 * scale, roughness: 0.5, seed: seed + 3, passes: 1 });
    return;
  }

  if (style === 'ninja') {
    // Black octagon shinobi buckler ("khiên bát giác đen")
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI * 2 * i) / 8 + Math.PI / 8;
      pts.push({ x: x + Math.cos(a) * r * 0.95, y: y + Math.sin(a) * r * 0.95 });
    }
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchPolyline(ctx, pts, { color: '#0F172A', lineWidth: 2.3 * scale, roughness: 0.55, seed: seed + 1, passes: 2 });
    drawSketchCircle(ctx, x, y, r * 0.38, { color: '#7C3AED', lineWidth: 1.7 * scale, roughness: 0.35, seed: seed + 2, passes: 1 });
    return;
  }

  if (style === 'kysilon') {
    // Heater heraldry shield with boar crest ("khiên gia huy heo")
    const w = r * 0.92;
    const h = r * 1.15;
    const pts = [
      { x: x - w, y: y - h * 0.85 },
      { x: x + w, y: y - h * 0.85 },
      { x: x + w * 0.85, y: y + h * 0.2 },
      { x: x, y: y + h },
      { x: x - w * 0.85, y: y + h * 0.2 },
      { x: x - w, y: y - h * 0.85 },
    ];
    ctx.save();
    ctx.fillStyle = 'rgba(244, 114, 182, 0.24)';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchPolyline(ctx, pts, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.7, seed: seed + 1, passes: 2 });
    // Little pig snout emblem in center
    drawSketchCircle(ctx, x + facing * 1.5 * scale, y - 1 * scale, 4.4 * scale, { color: '#DB2777', lineWidth: 1.7 * scale, roughness: 0.4, seed: seed + 2, passes: 1 });
    return;
  }

  if (style === 'nguoisoi') {
    // Claw-scarred wooden buckler ("khiên gỗ trầy xước")
    drawSketchCircle(ctx, x, y, r * 0.96, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 1.25, seed: seed + 1, passes: 2, alpha: 0.94 });
    drawSketchCircle(ctx, x, y, r * 0.62, { color: '#78350F', lineWidth: 1.6 * scale, roughness: 0.9, seed: seed + 2, passes: 1 });
    // Three diagonal claw slashes across shield face
    for (let ci = -1; ci <= 1; ci++) {
      drawSketchLine(
        ctx,
        x - r * 0.55 + ci * 3.5 * scale,
        y - r * 0.45 + ci * 2 * scale,
        x + r * 0.55 + ci * 3.5 * scale,
        y + r * 0.45 + ci * 2 * scale,
        { color: '#DC2626', lineWidth: 1.7 * scale, roughness: 0.4, seed: seed + 10 + ci, passes: 1 },
      );
    }
    return;
  }

  // Standard / Normal / Lon wood-and-iron round shield
  drawSketchCircle(ctx, x, y, r, {
    color: '#1E293B',
    lineWidth: 2.6 * scale,
    roughness: 1.05,
    seed: seed + 1,
    passes: 2,
    alpha: 0.94,
  });

  drawSketchCircle(ctx, x, y, r * 0.65, {
    color: '#92400E',
    lineWidth: 1.7 * scale,
    roughness: 0.85,
    seed: seed + 2,
    passes: 1,
    alpha: 0.8,
  });

  drawSketchLine(ctx, x - r * 0.72, y, x + r * 0.72, y, {
    color: '#78350F',
    lineWidth: 1.6 * scale,
    roughness: 0.6,
    seed: seed + 3,
    passes: 1,
    alpha: 0.75,
  });
  drawSketchLine(ctx, x, y - r * 0.72, x, y + r * 0.72, {
    color: '#78350F',
    lineWidth: 1.6 * scale,
    roughness: 0.6,
    seed: seed + 4,
    passes: 1,
    alpha: 0.75,
  });
  drawSketchCircle(ctx, x, y, 3.6 * scale, {
    color: '#1E293B',
    lineWidth: 2 * scale,
    roughness: 0.4,
    seed: seed + 5,
    passes: 2,
  });
}

export interface ThrownShield {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  omega: number;
  scale: number;
  ownerSide: 'left' | 'right';
  mode: 'ATTACK' | 'BOOMERANG' | 'LOOSE_BOUNCE' | 'RESTING';
  pickupDelay: number;
  restTimer: number;
  fadeTimer: number;
  dodgedTarget: boolean;
  seed: number;
  damage?: number;
  style?: WeaponStyle;
}

let nextShieldId = 1;

export function createThrownShield(
  x: number,
  y: number,
  vx: number,
  vy: number,
  scale: number,
  ownerSide: 'left' | 'right',
  damage = 18,
  style: WeaponStyle = 'standard',
): ThrownShield {
  const id = nextShieldId++;
  return {
    id,
    x,
    y,
    vx,
    vy,
    angle: 0,
    omega: (vx >= 0 ? 1 : -1) * 14,
    scale,
    ownerSide,
    mode: 'ATTACK',
    pickupDelay: 0.18,
    restTimer: 12,
    fadeTimer: 1.4,
    dodgedTarget: false,
    seed: 500 + id * 37.3,
    damage,
    style,
  };
}

export function drawThrownShield(
  ctx: CanvasRenderingContext2D,
  s: ThrownShield,
  boilTick: number,
) {
  const alpha =
    s.mode === 'RESTING' && s.restTimer <= 0 ? Math.max(0, s.fadeTimer / 1.4) : 0.96;
  if (alpha <= 0.02) return;

  const r = 16.5 * s.scale;
  const seed = s.seed + boilTick * 4.7;
  const isFlying = s.mode === 'ATTACK' || s.mode === 'BOOMERANG';

  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);

  if (isFlying) {
    drawSketchLine(ctx, -r * 1.45, -r * 0.55, -r * 0.85, -r * 0.55, {
      color: s.mode === 'BOOMERANG' ? '#2563EB' : '#64748B',
      lineWidth: 1.5 * s.scale,
      roughness: 0.8,
      seed: seed + 20,
      passes: 1,
      alpha: 0.65 * alpha,
    });
    drawSketchLine(ctx, -r * 1.6, r * 0.4, -r * 0.95, r * 0.4, {
      color: s.mode === 'BOOMERANG' ? '#2563EB' : '#64748B',
      lineWidth: 1.5 * s.scale,
      roughness: 0.8,
      seed: seed + 21,
      passes: 1,
      alpha: 0.65 * alpha,
    });
  }

  ctx.globalAlpha = alpha;
  drawHeldShield(ctx, 0, 0, 1, false, s.scale, seed, s.style ?? 'standard');
  ctx.restore();
}

/**
 * Draws a hand-sketched character-morphed weapon anchored at (ox, oy) pointing along (dx, dy) unit vector.
 */
export function drawHeldWeapon(
  ctx: CanvasRenderingContext2D,
  type: PrimaryWeaponType,
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  scale: number,
  seed: number,
  style: WeaponStyle = 'standard',
) {
  const def = WEAPONS[type];
  const len = def.length * scale;
  const px = -dy;
  const py = dx;
  const tipX = ox + dx * len;
  const tipY = oy + dy * len;

  // =========================================================================
  // GROUP 1: 'short' (Cận ngắn)
  // =========================================================================
  if (type === 'short') {
    if (style === 'nhoc') {
      // Box cutter ("dao rọc giấy")
      const bodyEndX = ox + dx * (len * 0.56);
      const bodyEndY = oy + dy * (len * 0.56);
      drawSketchLine(ctx, ox - px * 2.4 * scale, oy - py * 2.4 * scale, bodyEndX - px * 2.4 * scale, bodyEndY - py * 2.4 * scale, {
        color: '#F97316',
        lineWidth: 2.5 * scale,
        roughness: 0.6,
        seed: seed + 1,
        passes: 2,
      });
      drawSketchLine(ctx, ox + px * 2.4 * scale, oy + py * 2.4 * scale, bodyEndX + px * 2.4 * scale, bodyEndY + py * 2.4 * scale, {
        color: '#EA580C',
        lineWidth: 2.5 * scale,
        roughness: 0.6,
        seed: seed + 2,
        passes: 1,
      });
      drawSketchLine(ctx, bodyEndX - px * 1.5 * scale, bodyEndY - py * 1.5 * scale, tipX + px * 1.4 * scale, tipY + py * 1.4 * scale, {
        color: '#334155',
        lineWidth: 2.0 * scale,
        roughness: 0.5,
        seed: seed + 3,
        passes: 2,
      });
      drawSketchLine(ctx, bodyEndX + px * 1.8 * scale, bodyEndY + py * 1.8 * scale, tipX + px * 1.4 * scale, tipY + py * 1.4 * scale, {
        color: '#0F172A',
        lineWidth: 2.0 * scale,
        roughness: 0.5,
        seed: seed + 4,
        passes: 1,
      });
      return;
    }

    if (style === 'bucon') {
      // Butcher cleaver ("dao phay đồ tể")
      const hiltX = ox + dx * (9 * scale);
      const hiltY = oy + dy * (9 * scale);
      drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, hiltX, hiltY, {
        color: '#78350F',
        lineWidth: 2.8 * scale,
        roughness: 0.65,
        seed: seed + 1,
        passes: 2,
      });
      const bw = 6.2 * scale;
      const pts = [
        { x: hiltX - px * 2 * scale, y: hiltY - py * 2 * scale },
        { x: tipX - px * 2 * scale, y: tipY - py * 2 * scale },
        { x: tipX + px * bw, y: tipY + py * bw },
        { x: hiltX + px * bw, y: hiltY + py * bw },
        { x: hiltX - px * 2 * scale, y: hiltY - py * 2 * scale },
      ];
      drawSketchPolyline(ctx, pts, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.7, seed: seed + 2, passes: 2 });
      drawSketchCircle(ctx, tipX - dx * 4 * scale + px * 2 * scale, tipY - dy * 4 * scale + py * 2 * scale, 1.8 * scale, {
        color: '#475569',
        lineWidth: 1.4 * scale,
        roughness: 0.3,
        seed: seed + 3,
        passes: 1,
      });
      return;
    }

    if (style === 'caokieu') {
      // Sharp drafting compass ("compa nhọn")
      const headX = ox + dx * (4 * scale);
      const headY = oy + dy * (4 * scale);
      drawSketchCircle(ctx, headX, headY, 3.2 * scale, { color: '#0F172A', lineWidth: 1.8 * scale, roughness: 0.4, seed: seed + 1, passes: 1 });
      drawSketchLine(ctx, headX - px * 2.5 * scale, headY - py * 2.5 * scale, tipX - px * 3.5 * scale, tipY - py * 3.5 * scale, {
        color: '#334155',
        lineWidth: 1.9 * scale,
        roughness: 0.5,
        seed: seed + 2,
        passes: 1,
      });
      drawSketchLine(ctx, headX + px * 2.5 * scale, headY + py * 2.5 * scale, tipX + px * 2.2 * scale, tipY + py * 2.2 * scale, {
        color: '#16A34A',
        lineWidth: 1.9 * scale,
        roughness: 0.5,
        seed: seed + 3,
        passes: 1,
      });
      return;
    }

    if (style === 'lonsat') {
      // Soldering iron ("mỏ hàn nhiệt")
      const neckX = ox + dx * (12 * scale);
      const neckY = oy + dy * (12 * scale);
      drawSketchLine(ctx, ox - dx * 4 * scale, oy - dy * 4 * scale, neckX, neckY, {
        color: '#0D9488',
        lineWidth: 3.4 * scale,
        roughness: 0.6,
        seed: seed + 1,
        passes: 2,
      });
      drawSketchLine(ctx, neckX, neckY, tipX - dx * 5 * scale, tipY - dy * 5 * scale, {
        color: '#475569',
        lineWidth: 2.2 * scale,
        roughness: 0.45,
        seed: seed + 2,
        passes: 2,
      });
      drawSketchLine(ctx, tipX - dx * 5 * scale, tipY - dy * 5 * scale, tipX, tipY, {
        color: '#EA580C',
        lineWidth: 2.4 * scale,
        roughness: 0.4,
        seed: seed + 3,
        passes: 2,
      });
      return;
    }

    if (style === 'hebongbay') {
      // Circus throwing knife ("dao phóng xiếc")
      const hiltX = ox + dx * (8 * scale);
      const hiltY = oy + dy * (8 * scale);
      drawSketchLine(ctx, ox - dx * 4 * scale, oy - dy * 4 * scale, hiltX, hiltY, {
        color: '#7C3AED',
        lineWidth: 2.5 * scale,
        roughness: 0.6,
        seed: seed + 1,
        passes: 2,
      });
      drawSketchCircle(ctx, ox - dx * 4 * scale, oy - dy * 4 * scale, 2.8 * scale, {
        color: '#F59E0B',
        lineWidth: 1.8 * scale,
        roughness: 0.4,
        seed: seed + 2,
        passes: 1,
      });
      drawSketchLine(ctx, hiltX - px * 3.5 * scale, hiltY - py * 3.5 * scale, tipX, tipY, { color: '#DC2626', lineWidth: 2.1 * scale, roughness: 0.6, seed: seed + 3 });
      drawSketchLine(ctx, hiltX + px * 3.5 * scale, hiltY + py * 3.5 * scale, tipX, tipY, { color: '#334155', lineWidth: 2.0 * scale, roughness: 0.6, seed: seed + 4 });
      return;
    }

    if (style === 'ninja') {
      // Ringed Kunai ("kunai buộc dây")
      const hiltX = ox + dx * (9 * scale);
      const hiltY = oy + dy * (9 * scale);
      drawSketchCircle(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, 3.3 * scale, {
        color: '#7C3AED',
        lineWidth: 1.9 * scale,
        roughness: 0.4,
        seed: seed + 1,
        passes: 1,
      });
      drawSketchLine(ctx, ox - dx * 3 * scale, oy - dy * 3 * scale, hiltX, hiltY, {
        color: '#0F172A',
        lineWidth: 2.4 * scale,
        roughness: 0.5,
        seed: seed + 2,
      });
      const midX = ox + dx * (len * 0.48);
      const midY = oy + dy * (len * 0.48);
      const pts = [
        { x: hiltX, y: hiltY },
        { x: midX - px * 4.5 * scale, y: midY - py * 4.5 * scale },
        { x: tipX, y: tipY },
        { x: midX + px * 4.5 * scale, y: midY + py * 4.5 * scale },
        { x: hiltX, y: hiltY },
      ];
      drawSketchPolyline(ctx, pts, { color: '#0F172A', lineWidth: 2.0 * scale, roughness: 0.5, seed: seed + 3, passes: 2 });
      return;
    }

    if (style === 'kysilon') {
      // Knight's rondel dagger ("dao găm giáp sĩ")
      const hiltX = ox + dx * (8 * scale);
      const hiltY = oy + dy * (8 * scale);
      drawSketchLine(ctx, ox - dx * 4 * scale, oy - dy * 4 * scale, hiltX, hiltY, { color: '#78350F', lineWidth: 2.4 * scale, roughness: 0.6, seed: seed + 1 });
      drawSketchLine(ctx, hiltX - px * 5 * scale, hiltY - py * 5 * scale, hiltX + px * 5 * scale, hiltY + py * 5 * scale, { color: '#B45309', lineWidth: 2.6 * scale, roughness: 0.5, seed: seed + 2 });
      drawSketchLine(ctx, hiltX - px * 2.5 * scale, hiltY - py * 2.5 * scale, tipX, tipY, { color: '#1E293B', lineWidth: 2.1 * scale, roughness: 0.6, seed: seed + 3 });
      drawSketchLine(ctx, hiltX + px * 2.5 * scale, hiltY + py * 2.5 * scale, tipX, tipY, { color: '#475569', lineWidth: 1.8 * scale, roughness: 0.6, seed: seed + 4 });
      return;
    }

    if (style === 'nguoisoi') {
      // Triple bone claws ("móng vuốt xương")
      drawSketchLine(ctx, ox - px * 4 * scale, oy - py * 4 * scale, ox + px * 4 * scale, oy + py * 4 * scale, {
        color: '#334155',
        lineWidth: 2.8 * scale,
        roughness: 0.7,
        seed: seed + 1,
      });
      for (let ci = -1; ci <= 1; ci++) {
        const baseX = ox + px * (ci * 3.4 * scale);
        const baseY = oy + py * (ci * 3.4 * scale);
        const cLen = ci === 0 ? len * 1.05 : len * 0.85;
        const midX = baseX + dx * (cLen * 0.55) + px * (ci * 1.6 * scale);
        const midY = baseY + dy * (cLen * 0.55) + py * (ci * 1.6 * scale);
        const endX = baseX + dx * cLen + px * (ci * 2.2 * scale);
        const endY = baseY + dy * cLen + py * (ci * 2.2 * scale);
        drawSketchPolyline(ctx, [{ x: baseX, y: baseY }, { x: midX, y: midY }, { x: endX, y: endY }], {
          color: ci === 0 ? '#DC2626' : '#1E293B',
          lineWidth: 1.9 * scale,
          roughness: 0.45,
          seed: seed + 4 + ci,
          passes: 2,
        });
      }
      return;
    }

    // Standard dagger ("dao găm mực")
    const hiltX = ox + dx * (8 * scale);
    const hiltY = oy + dy * (8 * scale);
    drawSketchLine(ctx, ox - dx * 4 * scale, oy - dy * 4 * scale, hiltX, hiltY, { color: '#475569', lineWidth: 2.4 * scale, roughness: 0.6, seed: seed + 1, passes: 2 });
    drawSketchLine(ctx, hiltX - px * 5 * scale, hiltY - py * 5 * scale, hiltX + px * 5 * scale, hiltY + py * 5 * scale, { color: '#92400E', lineWidth: 2.3 * scale, roughness: 0.6, seed: seed + 2, passes: 1 });
    drawSketchLine(ctx, hiltX - px * 2.2 * scale, hiltY - py * 2.2 * scale, tipX, tipY, { color: '#0F172A', lineWidth: 2.0 * scale, roughness: 0.7, seed: seed + 3, passes: 2 });
    drawSketchLine(ctx, hiltX + px * 2.2 * scale, hiltY + py * 2.2 * scale, tipX, tipY, { color: '#475569', lineWidth: 1.6 * scale, roughness: 0.7, seed: seed + 4, passes: 1 });
    return;
  }

  // =========================================================================
  // GROUP 2: 'medium' (Tầm trung)
  // =========================================================================
  if (type === 'medium') {
    if (style === 'hebongbay') {
      // Twisted colorful balloon sword ("kiếm bóng bay")
      const hiltX = ox + dx * (10 * scale);
      const hiltY = oy + dy * (10 * scale);
      drawSketchCircle(ctx, hiltX - px * 5.5 * scale, hiltY - py * 5.5 * scale, 4.4 * scale, {
        color: '#7C3AED',
        lineWidth: 2.2 * scale,
        roughness: 0.6,
        seed: seed + 1,
        passes: 2,
      });
      drawSketchCircle(ctx, hiltX + px * 5.5 * scale, hiltY + py * 5.5 * scale, 4.4 * scale, {
        color: '#F59E0B',
        lineWidth: 2.2 * scale,
        roughness: 0.6,
        seed: seed + 2,
        passes: 2,
      });
      const segs = 3;
      for (let i = 0; i < segs; i++) {
        const t0 = i / segs;
        const t1 = (i + 1) / segs;
        const sx = hiltX + (tipX - hiltX) * t0;
        const sy = hiltY + (tipY - hiltY) * t0;
        const ex = hiltX + (tipX - hiltX) * t1;
        const ey = hiltY + (tipY - hiltY) * t1;
        const col = i % 2 === 0 ? '#DC2626' : '#7C3AED';
        drawSketchLine(ctx, sx - px * 2.6 * scale, sy - py * 2.6 * scale, ex - px * 2.2 * scale, ey - py * 2.2 * scale, {
          color: col,
          lineWidth: 2.3 * scale,
          roughness: 0.65,
          seed: seed + 3 + i,
          passes: 2,
        });
        drawSketchLine(ctx, sx + px * 2.6 * scale, sy + py * 2.6 * scale, ex + px * 2.2 * scale, ey + py * 2.2 * scale, {
          color: col,
          lineWidth: 2.1 * scale,
          roughness: 0.65,
          seed: seed + 8 + i,
          passes: 1,
        });
      }
      drawSketchCircle(ctx, tipX + dx * 2 * scale, tipY + dy * 2 * scale, 2.3 * scale, {
        color: '#F59E0B',
        lineWidth: 1.8 * scale,
        roughness: 0.4,
        seed: seed + 12,
        passes: 1,
      });
      return;
    }

    if (style === 'nhoc') {
      // Notched wooden school ruler ("thước gỗ sứt mẻ")
      const gripX = ox - dx * (4 * scale);
      const gripY = oy - dy * (4 * scale);
      const w = 3.6 * scale;
      drawSketchLine(ctx, gripX - px * w, gripY - py * w, tipX - px * w, tipY - py * w, { color: '#D97706', lineWidth: 2.2 * scale, roughness: 0.85, seed: seed + 1, passes: 2 });
      drawSketchLine(ctx, gripX + px * w, gripY + py * w, tipX + px * w, tipY + py * w, { color: '#92400E', lineWidth: 2.2 * scale, roughness: 0.85, seed: seed + 2, passes: 2 });
      drawSketchLine(ctx, tipX - px * w, tipY - py * w, tipX + px * w, tipY + py * w, { color: '#92400E', lineWidth: 2.1 * scale, roughness: 0.7, seed: seed + 3 });
      for (let ti = 1; ti <= 5; ti++) {
        const t = ti * 0.16;
        const mx = gripX + (tipX - gripX) * t;
        const my = gripY + (tipY - gripY) * t;
        drawSketchLine(ctx, mx - px * w, my - py * w, mx - px * (w * 0.15), my - py * (w * 0.15), {
          color: '#78350F',
          lineWidth: 1.3 * scale,
          roughness: 0.3,
          seed: seed + 10 + ti,
          passes: 1,
        });
      }
      return;
    }

    if (style === 'bucon') {
      // Heavy iron pipe ("ống tuýp sắt")
      const gripX = ox - dx * (4 * scale);
      const gripY = oy - dy * (4 * scale);
      drawSketchLine(ctx, gripX - px * 2.8 * scale, gripY - py * 2.8 * scale, tipX - px * 2.8 * scale, tipY - py * 2.8 * scale, {
        color: '#334155',
        lineWidth: 2.6 * scale,
        roughness: 0.7,
        seed: seed + 1,
        passes: 2,
      });
      drawSketchLine(ctx, gripX + px * 2.8 * scale, gripY + py * 2.8 * scale, tipX + px * 2.8 * scale, tipY + py * 2.8 * scale, {
        color: '#475569',
        lineWidth: 2.4 * scale,
        roughness: 0.7,
        seed: seed + 2,
        passes: 2,
      });
      drawSketchCircle(ctx, tipX, tipY, 3.6 * scale, { color: '#1E293B', lineWidth: 2.1 * scale, roughness: 0.5, seed: seed + 3, passes: 1 });
      return;
    }

    if (style === 'caokieu') {
      // T-square drafting ruler ("thước chữ T")
      drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, tipX, tipY, { color: '#78350F', lineWidth: 2.4 * scale, roughness: 0.65, seed: seed + 1, passes: 2 });
      drawSketchLine(ctx, tipX - px * 11 * scale, tipY - py * 11 * scale, tipX + px * 11 * scale, tipY + py * 11 * scale, {
        color: '#16A34A',
        lineWidth: 3.1 * scale,
        roughness: 0.6,
        seed: seed + 2,
        passes: 2,
      });
      return;
    }

    if (style === 'lonsat') {
      // Flat mechanic wrench ("cờ lê dẹt")
      const neckX = ox + dx * (len - 9 * scale);
      const neckY = oy + dy * (len - 9 * scale);
      drawSketchLine(ctx, ox - dx * 4 * scale, oy - dy * 4 * scale, neckX, neckY, { color: '#475569', lineWidth: 3.4 * scale, roughness: 0.55, seed: seed + 1, passes: 2 });
      drawSketchLine(ctx, neckX - px * 5 * scale, neckY - py * 5 * scale, tipX - px * 5.5 * scale, tipY - py * 5.5 * scale, { color: '#1E293B', lineWidth: 2.2 * scale, roughness: 0.45, seed: seed + 2 });
      drawSketchLine(ctx, neckX + px * 5 * scale, neckY + py * 5 * scale, tipX + px * 5.5 * scale, tipY + py * 5.5 * scale, { color: '#1E293B', lineWidth: 2.2 * scale, roughness: 0.45, seed: seed + 3 });
      drawSketchLine(ctx, neckX - px * 3 * scale, neckY - py * 3 * scale, neckX + px * 3 * scale, neckY + py * 3 * scale, { color: '#0D9488', lineWidth: 2.0 * scale, roughness: 0.4, seed: seed + 4 });
      return;
    }

    if (style === 'ninja') {
      // Slightly curved black ink Katana ("katana mực đen")
      const hiltX = ox + dx * (10 * scale);
      const hiltY = oy + dy * (10 * scale);
      drawSketchLine(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, hiltX, hiltY, { color: '#0F172A', lineWidth: 2.5 * scale, roughness: 0.45, seed: seed + 1, passes: 2 });
      drawSketchLine(ctx, hiltX - px * 4.8 * scale, hiltY - py * 4.8 * scale, hiltX + px * 4.8 * scale, hiltY + py * 4.8 * scale, { color: '#7C3AED', lineWidth: 2.5 * scale, roughness: 0.4, seed: seed + 2 });
      const midX = (hiltX + tipX) * 0.5 + px * 3.4 * scale;
      const midY = (hiltY + tipY) * 0.5 + py * 3.4 * scale;
      drawSketchPolyline(ctx, [{ x: hiltX, y: hiltY }, { x: midX, y: midY }, { x: tipX + px * 1.5 * scale, y: tipY + py * 1.5 * scale }], {
        color: '#0F172A',
        lineWidth: 2.3 * scale,
        roughness: 0.5,
        seed: seed + 3,
        passes: 2,
      });
      return;
    }

    if (style === 'nguoisoi') {
      // Jagged rusty chain-blade ("xích đao gỉ sét")
      const hiltX = ox + dx * (9 * scale);
      const hiltY = oy + dy * (9 * scale);
      drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, hiltX, hiltY, { color: '#475569', lineWidth: 2.6 * scale, roughness: 0.7, seed: seed + 1 });
      const midX = (hiltX + tipX) * 0.5 - px * 4 * scale;
      const midY = (hiltY + tipY) * 0.5 - py * 4 * scale;
      drawSketchPolyline(ctx, [{ x: hiltX, y: hiltY }, { x: midX, y: midY }, { x: tipX, y: tipY }], {
        color: '#9A3412',
        lineWidth: 2.5 * scale,
        roughness: 0.9,
        seed: seed + 2,
        passes: 2,
      });
      drawSketchLine(ctx, midX, midY, tipX - px * 4 * scale, tipY - py * 4 * scale, { color: '#1E293B', lineWidth: 2.0 * scale, roughness: 0.8, seed: seed + 3 });
      return;
    }

    // Standard / Kỵ Sĩ Lợn / Lợn sword ("kiếm mực" / "kiếm kỵ sĩ")
    const hiltX = ox + dx * (10 * scale);
    const hiltY = oy + dy * (10 * scale);
    drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, hiltX, hiltY, {
      color: '#475569',
      lineWidth: 2.8 * scale,
      roughness: 0.7,
      seed: seed + 1,
      passes: 2,
    });
    drawSketchLine(ctx, hiltX - px * 8 * scale, hiltY - py * 8 * scale, hiltX + px * 8 * scale, hiltY + py * 8 * scale, {
      color: style === 'kysilon' ? '#B45309' : '#92400E',
      lineWidth: 2.6 * scale,
      roughness: 0.7,
      seed: seed + 2,
      passes: 2,
    });
    drawSketchLine(ctx, hiltX - px * 3 * scale, hiltY - py * 3 * scale, tipX, tipY, {
      color: '#1E293B',
      lineWidth: 2.1 * scale,
      roughness: 0.9,
      seed: seed + 3,
      passes: 2,
    });
    drawSketchLine(ctx, hiltX + px * 3 * scale, hiltY + py * 3 * scale, tipX, tipY, {
      color: '#475569',
      lineWidth: 1.7 * scale,
      roughness: 0.9,
      seed: seed + 4,
      passes: 1,
    });
    return;
  }

  // =========================================================================
  // GROUP 3: 'long' (Cán dài)
  // =========================================================================
  if (type === 'long') {
    const baseTailX = ox - dx * (15 * scale);
    const baseTailY = oy - dy * (15 * scale);
    const headBaseX = ox + dx * (len - 13 * scale);
    const headBaseY = oy + dy * (len - 13 * scale);

    if (style === 'hebongbay') {
      // Toy BANG! flag spear ("giáo cờ BANG!")
      drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, { color: '#7C3AED', lineWidth: 2.5 * scale, roughness: 0.75, seed: seed + 8, passes: 2 });
      drawSketchLine(ctx, headBaseX - px * 4.5 * scale, headBaseY - py * 4.5 * scale, tipX, tipY, { color: '#F59E0B', lineWidth: 2.2 * scale, roughness: 0.65, seed: seed + 9, passes: 2 });
      drawSketchLine(ctx, headBaseX + px * 4.5 * scale, headBaseY + py * 4.5 * scale, tipX, tipY, { color: '#DC2626', lineWidth: 2.0 * scale, roughness: 0.65, seed: seed + 10, passes: 2 });
      const fBaseX = headBaseX - dx * 6 * scale;
      const fBaseY = headBaseY - dy * 6 * scale;
      const fDropX = fBaseX + px * 9 * scale - dx * 5 * scale;
      const fDropY = fBaseY + py * 9 * scale - dy * 5 * scale;
      drawSketchLine(ctx, headBaseX, headBaseY, fDropX, fDropY, { color: '#DC2626', lineWidth: 1.8 * scale, roughness: 0.5, seed: seed + 11, passes: 1 });
      drawSketchLine(ctx, fBaseX, fBaseY, fDropX, fDropY, { color: '#F59E0B', lineWidth: 1.8 * scale, roughness: 0.5, seed: seed + 12, passes: 1 });
      return;
    }

    if (style === 'nhoc') {
      // Giant mop ("chổi lau nhà dài")
      drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, { color: '#EA580C', lineWidth: 2.2 * scale, roughness: 0.7, seed: seed + 8, passes: 2 });
      drawSketchLine(ctx, headBaseX - px * 8 * scale, headBaseY - py * 8 * scale, headBaseX + px * 8 * scale, headBaseY + py * 8 * scale, { color: '#334155', lineWidth: 2.5 * scale, roughness: 0.6, seed: seed + 9 });
      for (let bi = -2; bi <= 2; bi++) {
        drawSketchLine(ctx, headBaseX + px * (bi * 3.3 * scale), headBaseY + py * (bi * 3.3 * scale), tipX + px * (bi * 4.1 * scale), tipY + py * (bi * 4.1 * scale), {
          color: bi % 2 === 0 ? '#94A3B8' : '#64748B',
          lineWidth: 1.8 * scale,
          roughness: 0.9,
          seed: seed + 12 + bi,
          passes: 1,
        });
      }
      return;
    }

    if (style === 'caokieu') {
      // Long bamboo fishing rod ("cần câu tre") with dangling hook line
      drawSketchLine(ctx, baseTailX, baseTailY, tipX, tipY, { color: '#15803D', lineWidth: 2.3 * scale, roughness: 0.85, seed: seed + 8, passes: 2 });
      for (let ni = 1; ni <= 3; ni++) {
        const t = ni * 0.25;
        const jx = baseTailX + (tipX - baseTailX) * t;
        const jy = baseTailY + (tipY - baseTailY) * t;
        drawSketchLine(ctx, jx - px * 2.5 * scale, jy - py * 2.5 * scale, jx + px * 2.5 * scale, jy + py * 2.5 * scale, { color: '#78350F', lineWidth: 1.6 * scale, roughness: 0.3, seed: seed + 12 + ni, passes: 1 });
      }
      // Fishing line & bobber near tip
      const bobX = tipX + px * 5 * scale + dy * 8 * scale;
      const bobY = tipY + py * 5 * scale + 10 * scale;
      drawSketchLine(ctx, tipX, tipY, bobX, bobY, { color: '#64748B', lineWidth: 1.2 * scale, roughness: 0.3, seed: seed + 18, passes: 1 });
      drawSketchCircle(ctx, bobX, bobY, 2.4 * scale, { color: '#DC2626', lineWidth: 1.6 * scale, roughness: 0.3, seed: seed + 19, passes: 1 });
      return;
    }

    if (style === 'bucon') {
      // Heavy crowbar ("xà beng dài")
      drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, { color: '#334155', lineWidth: 3.1 * scale, roughness: 0.75, seed: seed + 8, passes: 2 });
      drawSketchPolyline(ctx, [
        { x: headBaseX, y: headBaseY },
        { x: tipX - dx * 3 * scale + px * 5 * scale, y: tipY - dy * 3 * scale + py * 5 * scale },
        { x: tipX + px * 8 * scale, y: tipY + py * 8 * scale },
      ], { color: '#DC2626', lineWidth: 2.7 * scale, roughness: 0.6, seed: seed + 9, passes: 2 });
      return;
    }

    if (style === 'lonsat') {
      // Steel exhaust pipe ("ống xả dài")
      drawSketchLine(ctx, baseTailX, baseTailY, tipX - dx * 12 * scale, tipY - dy * 12 * scale, { color: '#475569', lineWidth: 3.2 * scale, roughness: 0.6, seed: seed + 8, passes: 2 });
      drawSketchLine(ctx, tipX - dx * 12 * scale - px * 4 * scale, tipY - dy * 12 * scale - py * 4 * scale, tipX - px * 4 * scale, tipY - py * 4 * scale, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.45, seed: seed + 9 });
      drawSketchLine(ctx, tipX - dx * 12 * scale + px * 4 * scale, tipY - dy * 12 * scale + py * 4 * scale, tipX + px * 4 * scale, tipY + py * 4 * scale, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.45, seed: seed + 10 });
      drawSketchLine(ctx, tipX - px * 4 * scale, tipY - py * 4 * scale, tipX + px * 4 * scale, tipY + py * 4 * scale, { color: '#EA580C', lineWidth: 2.0 * scale, roughness: 0.4, seed: seed + 11 });
      return;
    }

    if (style === 'ninja') {
      // Naginata polearm ("naginata")
      drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, { color: '#0F172A', lineWidth: 2.4 * scale, roughness: 0.65, seed: seed + 8, passes: 2 });
      const midX = (headBaseX + tipX) * 0.5 + px * 4.2 * scale;
      const midY = (headBaseY + tipY) * 0.5 + py * 4.2 * scale;
      drawSketchPolyline(ctx, [{ x: headBaseX, y: headBaseY }, { x: midX, y: midY }, { x: tipX + px * 2 * scale, y: tipY + py * 2 * scale }], {
        color: '#7C3AED',
        lineWidth: 2.4 * scale,
        roughness: 0.5,
        seed: seed + 9,
        passes: 2,
      });
      return;
    }

    if (style === 'kysilon') {
      // Jousting cavalry lance with ribbon pennant ("thương kỵ binh")
      drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, { color: '#92400E', lineWidth: 2.7 * scale, roughness: 0.7, seed: seed + 8, passes: 2 });
      // Hand guard cone
      drawSketchPolyline(ctx, [
        { x: ox + dx * 6 * scale - px * 6 * scale, y: oy + dy * 6 * scale - py * 6 * scale },
        { x: ox + dx * 14 * scale, y: oy + dy * 14 * scale },
        { x: ox + dx * 6 * scale + px * 6 * scale, y: oy + dy * 6 * scale + py * 6 * scale },
      ], { color: '#B45309', lineWidth: 2.0 * scale, roughness: 0.45, seed: seed + 9 });
      drawSketchLine(ctx, headBaseX - px * 4.5 * scale, headBaseY - py * 4.5 * scale, tipX, tipY, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.6, seed: seed + 10 });
      drawSketchLine(ctx, headBaseX + px * 4.5 * scale, headBaseY + py * 4.5 * scale, tipX, tipY, { color: '#DB2777', lineWidth: 2.0 * scale, roughness: 0.6, seed: seed + 11 });
      drawSketchLine(ctx, headBaseX, headBaseY, headBaseX - dx * 9 * scale + px * 8 * scale, headBaseY - dy * 9 * scale + py * 8 * scale, { color: '#F472B6', lineWidth: 2.0 * scale, roughness: 0.5, seed: seed + 12, passes: 1 });
      return;
    }

    // Standard & Nguoisoi ("giáo dài" / "cọc săn sói")
    drawSketchLine(ctx, baseTailX, baseTailY, headBaseX, headBaseY, {
      color: style === 'nguoisoi' ? '#57534E' : '#78350F',
      lineWidth: 2.4 * scale,
      roughness: 0.95,
      seed: seed + 8,
      passes: 2,
    });
    drawSketchLine(ctx, headBaseX - px * 4.5 * scale, headBaseY - py * 4.5 * scale, tipX, tipY, {
      color: '#1E293B',
      lineWidth: 2.2 * scale,
      roughness: 0.7,
      seed: seed + 9,
      passes: 2,
    });
    drawSketchLine(ctx, headBaseX + px * 4.5 * scale, headBaseY + py * 4.5 * scale, tipX, tipY, {
      color: '#DC2626',
      lineWidth: 1.8 * scale,
      roughness: 0.7,
      seed: seed + 10,
      passes: 1,
    });
    drawSketchLine(ctx, headBaseX - px * 4.5 * scale, headBaseY - py * 4.5 * scale, headBaseX + px * 4.5 * scale, headBaseY + py * 4.5 * scale, {
      color: '#1E293B',
      lineWidth: 1.8 * scale,
      roughness: 0.6,
      seed: seed + 11,
      passes: 1,
    });
    return;
  }

  // =========================================================================
  // GROUP 4: 'heavy' (Hạng nặng)
  // =========================================================================
  if (style === 'hebongbay') {
    // Squeaky smiley mallet ("búa cao su kêu chít")
    const handleEndX = ox + dx * (len - 7 * scale);
    const handleEndY = oy + dy * (len - 7 * scale);
    drawSketchLine(ctx, ox - dx * 5 * scale, oy - dy * 5 * scale, handleEndX, handleEndY, {
      color: '#2563EB',
      lineWidth: 2.6 * scale,
      roughness: 0.6,
      seed: seed + 12,
      passes: 2,
    });
    const hcX = ox + dx * (len - 7 * scale);
    const hcY = oy + dy * (len - 7 * scale);
    const hw = 11.5 * scale;
    const hh = 7.2 * scale;
    const c1x = hcX - px * hw - dx * hh;
    const c1y = hcY - py * hw - dy * hh;
    const c2x = hcX + px * hw - dx * hh;
    const c2y = hcY + py * hw - dy * hh;
    const c3x = hcX + px * hw + dx * hh;
    const c3y = hcY + py * hw + dy * hh;
    const c4x = hcX - px * hw + dx * hh;
    const c4y = hcY - py * hw + dy * hh;
    ctx.save();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.beginPath();
    ctx.moveTo(c1x, c1y);
    ctx.lineTo(c2x, c2y);
    ctx.lineTo(c3x, c3y);
    ctx.lineTo(c4x, c4y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchLine(ctx, c1x, c1y, c2x, c2y, { color: '#DC2626', lineWidth: 2.5 * scale, roughness: 0.65, seed: seed + 13 });
    drawSketchLine(ctx, c2x, c2y, c3x, c3y, { color: '#F59E0B', lineWidth: 2.6 * scale, roughness: 0.65, seed: seed + 14 });
    drawSketchLine(ctx, c3x, c3y, c4x, c4y, { color: '#DC2626', lineWidth: 2.5 * scale, roughness: 0.65, seed: seed + 15 });
    drawSketchLine(ctx, c4x, c4y, c1x, c1y, { color: '#F59E0B', lineWidth: 2.6 * scale, roughness: 0.65, seed: seed + 16 });
    drawSketchCircle(ctx, hcX, hcY, 4.2 * scale, {
      color: '#1E293B',
      lineWidth: 1.4 * scale,
      roughness: 0.4,
      seed: seed + 18,
      passes: 1,
    });
    return;
  }

  if (style === 'lonsat') {
    // Giant mechanic wrench ("cờ lê khổng lồ")
    const tailX = ox - dx * (8 * scale);
    const tailY = oy - dy * (8 * scale);
    const neckX = ox + dx * (len - 13 * scale);
    const neckY = oy + dy * (len - 13 * scale);
    drawSketchLine(ctx, tailX - px * 2.2 * scale, tailY - py * 2.2 * scale, neckX - px * 2.6 * scale, neckY - py * 2.6 * scale, {
      color: '#334155',
      lineWidth: 2.3 * scale,
      roughness: 0.6,
      seed: seed + 12,
      passes: 2,
    });
    drawSketchLine(ctx, tailX + px * 2.2 * scale, tailY + py * 2.2 * scale, neckX + px * 2.6 * scale, neckY + py * 2.6 * scale, {
      color: '#475569',
      lineWidth: 2.1 * scale,
      roughness: 0.6,
      seed: seed + 13,
      passes: 1,
    });
    drawSketchCircle(ctx, tailX, tailY, 4.2 * scale, { color: '#334155', lineWidth: 2.1 * scale, roughness: 0.45, seed: seed + 14, passes: 1 });
    const jw = 10.5 * scale;
    const jawBaseX = neckX;
    const jawBaseY = neckY;
    const jawTipL = { x: jawBaseX + dx * 14 * scale - px * jw, y: jawBaseY + dy * 14 * scale - py * jw };
    const jawTipR = { x: jawBaseX + dx * 14 * scale + px * jw, y: jawBaseY + dy * 14 * scale + py * jw };
    const slotL = { x: jawBaseX + dx * 5.5 * scale - px * 4.5 * scale, y: jawBaseY + dy * 5.5 * scale - py * 4.5 * scale };
    const slotR = { x: jawBaseX + dx * 5.5 * scale + px * 4.5 * scale, y: jawBaseY + dy * 5.5 * scale + py * 4.5 * scale };
    const outerL = { x: jawBaseX + dx * 4 * scale - px * (jw * 1.05), y: jawBaseY + dy * 4 * scale - py * (jw * 1.05) };
    const outerR = { x: jawBaseX + dx * 4 * scale + px * (jw * 1.05), y: jawBaseY + dy * 4 * scale + py * (jw * 1.05) };

    drawSketchLine(ctx, jawBaseX - px * 2.8 * scale, jawBaseY - py * 2.8 * scale, outerL.x, outerL.y, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 15 });
    drawSketchLine(ctx, outerL.x, outerL.y, jawTipL.x, jawTipL.y, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 16 });
    drawSketchLine(ctx, jawTipL.x, jawTipL.y, slotL.x, slotL.y, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.5, seed: seed + 17 });
    drawSketchLine(ctx, slotL.x, slotL.y, slotR.x, slotR.y, { color: '#475569', lineWidth: 2.1 * scale, roughness: 0.4, seed: seed + 18 });
    drawSketchLine(ctx, slotR.x, slotR.y, jawTipR.x, jawTipR.y, { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.5, seed: seed + 19 });
    drawSketchLine(ctx, jawTipR.x, jawTipR.y, outerR.x, outerR.y, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 20 });
    drawSketchLine(ctx, outerR.x, outerR.y, jawBaseX + px * 2.8 * scale, jawBaseY + py * 2.8 * scale, { color: '#1E293B', lineWidth: 2.5 * scale, roughness: 0.5, seed: seed + 21 });
    return;
  }

  if (style === 'bucon') {
    // Rebar-pierced concrete block ("tảng bê tông cốt thép")
    const neckX = ox + dx * (len - 10 * scale);
    const neckY = oy + dy * (len - 10 * scale);
    drawSketchLine(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, neckX, neckY, { color: '#475569', lineWidth: 3.1 * scale, roughness: 0.7, seed: seed + 12, passes: 2 });
    const hw = 12 * scale;
    const hh = 8 * scale;
    const pts = [
      { x: neckX - px * hw - dx * hh, y: neckY - py * hw - dy * hh },
      { x: neckX + px * hw - dx * hh, y: neckY + py * hw - dy * hh },
      { x: neckX + px * hw + dx * hh, y: neckY + py * hw + dy * hh },
      { x: neckX - px * hw + dx * hh, y: neckY - py * hw + dy * hh },
      { x: neckX - px * hw - dx * hh, y: neckY - py * hw - dy * hh },
    ];
    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSketchPolyline(ctx, pts, { color: '#1E293B', lineWidth: 2.7 * scale, roughness: 1.0, seed: seed + 13, passes: 2 });
    drawSketchLine(ctx, neckX - px * (hw + 4 * scale), neckY - py * (hw + 4 * scale), neckX + px * (hw + 4 * scale), neckY + py * (hw + 4 * scale), { color: '#9A3412', lineWidth: 1.8 * scale, roughness: 0.4, seed: seed + 14 });
    return;
  }

  if (style === 'caokieu') {
    // Wide barbell ("tạ đòn dài")
    const endX = ox + dx * (len - 6 * scale);
    const endY = oy + dy * (len - 6 * scale);
    drawSketchLine(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, endX, endY, { color: '#334155', lineWidth: 2.5 * scale, roughness: 0.55, seed: seed + 12 });
    drawSketchCircle(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, 5.5 * scale, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.5, seed: seed + 13 });
    drawSketchCircle(ctx, endX, endY, 7.2 * scale, { color: '#1E293B', lineWidth: 2.6 * scale, roughness: 0.55, seed: seed + 14, passes: 2 });
    return;
  }

  if (style === 'ninja') {
    // Spiked Tetsubo ("chùy gai tetsubo")
    const gripX = ox - dx * (5 * scale);
    const gripY = oy - dy * (5 * scale);
    drawSketchLine(ctx, gripX - px * 2 * scale, gripY - py * 2 * scale, tipX - px * 5 * scale, tipY - py * 5 * scale, { color: '#0F172A', lineWidth: 2.5 * scale, roughness: 0.65, seed: seed + 12, passes: 2 });
    drawSketchLine(ctx, gripX + px * 2 * scale, gripY + py * 2 * scale, tipX + px * 5 * scale, tipY + py * 5 * scale, { color: '#0F172A', lineWidth: 2.5 * scale, roughness: 0.65, seed: seed + 13, passes: 2 });
    drawSketchLine(ctx, tipX - px * 5 * scale, tipY - py * 5 * scale, tipX + px * 5 * scale, tipY + py * 5 * scale, { color: '#0F172A', lineWidth: 2.5 * scale, roughness: 0.6, seed: seed + 14 });
    for (let si = 1; si <= 3; si++) {
      const t = 0.35 + si * 0.18;
      const sx = gripX + (tipX - gripX) * t;
      const sy = gripY + (tipY - gripY) * t;
      drawSketchLine(ctx, sx - px * 4 * scale, sy - py * 4 * scale, sx - px * 8 * scale, sy - py * 8 * scale, { color: '#7C3AED', lineWidth: 1.8 * scale, roughness: 0.3, seed: seed + 20 + si });
      drawSketchLine(ctx, sx + px * 4 * scale, sy + py * 4 * scale, sx + px * 8 * scale, sy + py * 8 * scale, { color: '#7C3AED', lineWidth: 1.8 * scale, roughness: 0.3, seed: seed + 25 + si });
    }
    return;
  }

  if (style === 'kysilon') {
    // Double-headed battle axe ("rìu chiến hai lưỡi")
    const endX = ox + dx * (len - 5 * scale);
    const endY = oy + dy * (len - 5 * scale);
    drawSketchLine(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, endX, endY, { color: '#78350F', lineWidth: 2.6 * scale, roughness: 0.7, seed: seed + 12, passes: 2 });
    const headX = ox + dx * (len - 10 * scale);
    const headY = oy + dy * (len - 10 * scale);
    const bw = 12 * scale;
    const bh = 7.5 * scale;
    drawSketchPolyline(ctx, [
      { x: headX - px * bw - dx * bh, y: headY - py * bw - dy * bh },
      { x: headX, y: headY - dy * 3 * scale },
      { x: headX + px * bw - dx * bh, y: headY + py * bw - dy * bh },
      { x: headX + px * bw + dx * bh, y: headY + py * bw + dy * bh },
      { x: headX, y: headY + dy * 3 * scale },
      { x: headX - px * bw + dx * bh, y: headY - py * bw + dy * bh },
      { x: headX - px * bw - dx * bh, y: headY - py * bw - dy * bh },
    ], { color: '#1E293B', lineWidth: 2.3 * scale, roughness: 0.65, seed: seed + 13, passes: 2 });
    return;
  }

  if (style === 'nguoisoi') {
    // Dungeon chain stone ("đá ngục xích sắt")
    const chainEndX = ox + dx * (len - 12 * scale);
    const chainEndY = oy + dy * (len - 12 * scale);
    for (let li = 0; li < 4; li++) {
      const lx = ox + (chainEndX - ox) * (li / 3.5);
      const ly = oy + (chainEndY - oy) * (li / 3.5);
      drawSketchCircle(ctx, lx, ly, 3.0 * scale, { color: '#475569', lineWidth: 1.9 * scale, roughness: 0.4, seed: seed + 12 + li, passes: 1 });
    }
    drawSketchCircle(ctx, tipX - dx * 4 * scale, tipY - dy * 4 * scale, 10.5 * scale, { color: '#1E293B', lineWidth: 2.6 * scale, roughness: 1.35, seed: seed + 18, passes: 2 });
    return;
  }

  // Standard & Nhóc sledgehammer ("búa tạ" / "búa hơi khổng lồ")
  const handleEndX = ox + dx * (len - 6 * scale);
  const handleEndY = oy + dy * (len - 6 * scale);
  drawSketchLine(ctx, ox - dx * 6 * scale, oy - dy * 6 * scale, handleEndX, handleEndY, {
    color: style === 'nhoc' ? '#EA580C' : '#78350F',
    lineWidth: 2.6 * scale,
    roughness: 0.85,
    seed: seed + 12,
    passes: 2,
  });

  const headCenterX = ox + dx * (len - 7 * scale);
  const headCenterY = oy + dy * (len - 7 * scale);
  const hw = (style === 'nhoc' ? 11.5 : 10) * scale;
  const hh = (style === 'nhoc' ? 7.2 : 6) * scale;
  const c1x = headCenterX - px * hw - dx * hh;
  const c1y = headCenterY - py * hw - dy * hh;
  const c2x = headCenterX + px * hw - dx * hh;
  const c2y = headCenterY + py * hw - dy * hh;
  const c3x = headCenterX + px * hw + dx * hh;
  const c3y = headCenterY + py * hw + dy * hh;
  const c4x = headCenterX - px * hw + dx * hh;
  const c4y = headCenterY - py * hw + dy * hh;

  drawSketchLine(ctx, c1x, c1y, c2x, c2y, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 13 });
  drawSketchLine(ctx, c2x, c2y, c3x, c3y, { color: style === 'nhoc' ? '#F97316' : '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 14 });
  drawSketchLine(ctx, c3x, c3y, c4x, c4y, { color: '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 15 });
  drawSketchLine(ctx, c4x, c4y, c1x, c1y, { color: style === 'nhoc' ? '#F97316' : '#1E293B', lineWidth: 2.4 * scale, roughness: 0.7, seed: seed + 16 });
  drawSketchLine(ctx, c1x, c1y, c3x, c3y, { color: '#475569', lineWidth: 1.5 * scale, roughness: 0.6, seed: seed + 17, passes: 1, alpha: 0.65 });
  drawSketchLine(ctx, c2x, c2y, c4x, c4y, { color: '#475569', lineWidth: 1.5 * scale, roughness: 0.6, seed: seed + 18, passes: 1, alpha: 0.65 });
}

export interface DrawnWeapon {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  omega: number;
  localPoints: Array<{ x: number; y: number }>;
  radius: number;
  halfHeight: number;
  damage: number;
  knockback: number;
  sharpness: number;
  totalLength: number;
  color: string;
  seed: number;
  state: 'FALLING' | 'RESTING';
  restTimer: number;
  fadeTimer: number;
  hitUnitIds: Set<number>;
}

let nextDrawnId = 1;

/**
 * Analyzes a user's freehand doodle stroke and turns it into a physical falling weapon.
 * Damage scales with bounding size, total ink length, and sharpness (acute angles / spikes / thin pointiness).
 */
export function createDrawnWeaponFromStroke(
  rawPoints: Array<{ x: number; y: number }>,
  color = '#1E293B',
): DrawnWeapon | null {
  if (rawPoints.length < 2) return null;

  // Resample points so spacing is consistent (~8px) for clean angle/sharpness analysis
  const pts: Array<{ x: number; y: number }> = [rawPoints[0]];
  let totalLength = 0;
  for (let i = 1; i < rawPoints.length; i++) {
    const prev = pts[pts.length - 1];
    const curr = rawPoints[i];
    const d = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    if (d >= 7 || i === rawPoints.length - 1) {
      totalLength += d;
      pts.push(curr);
    }
  }

  if (totalLength < 20 || pts.length < 2) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let sumX = 0;
  let sumY = 0;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    sumX += p.x;
    sumY += p.y;
  }

  const cx = sumX / pts.length;
  const cy = sumY / pts.length;
  const w = Math.max(8, maxX - minX);
  const h = Math.max(8, maxY - minY);
  const bboxDiag = Math.hypot(w, h);

  // Measure sharpness: count acute bends / spikes along the polyline
  let sharpScoreAccum = 0;
  let sharpVertexCount = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const ax = pts[i].x - pts[i - 1].x;
    const ay = pts[i].y - pts[i - 1].y;
    const bx = pts[i + 1].x - pts[i].x;
    const by = pts[i + 1].y - pts[i].y;
    const la = Math.hypot(ax, ay);
    const lb = Math.hypot(bx, by);
    if (la < 2 || lb < 2) continue;

    const dot = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
    // Turn angle in [0, PI]: PI = complete 180° hairpin spike!
    const turn = Math.acos(dot);
    if (turn > Math.PI * 0.48) {
      // Sharp corner / spike!
      sharpScoreAccum += (turn - Math.PI * 0.45) / (Math.PI * 0.55);
      sharpVertexCount++;
    }
  }

  // Elongated needle/spear-like strokes also carry intrinsic pointiness
  const aspect = Math.max(w / h, h / w);
  const elongationBonus = Math.min(0.45, Math.max(0, (aspect - 1.8) * 0.12));
  const vertexSharpness = Math.min(1, sharpScoreAccum * 0.28 + sharpVertexCount * 0.08);
  const sharpness = Math.max(0.05, Math.min(1, vertexSharpness + elongationBonus));

  // Damage calculation: length + size + sharpness multiplier
  const lengthComponent = Math.min(26, totalLength / 26);
  const sizeComponent = Math.min(18, bboxDiag / 18);
  const rawDmg = (4 + lengthComponent + sizeComponent) * (0.72 + sharpness * 1.05);
  const damage = Math.max(5, Math.min(60, Math.round(rawDmg)));
  const knockback = Math.round(130 + sizeComponent * 11 + sharpness * 140);

  const localPoints = pts.map((p) => ({ x: p.x - cx, y: p.y - cy }));
  let maxR = 8;
  for (const lp of localPoints) {
    const d = Math.hypot(lp.x, lp.y);
    if (d > maxR) maxR = d;
  }

  const id = nextDrawnId++;
  return {
    id,
    x: cx,
    y: cy,
    vx: (hash1D(id * 3.1) * 28),
    vy: 25,
    angle: 0,
    omega: hash1D(id * 7.3) * 3.2,
    localPoints,
    radius: maxR,
    halfHeight: Math.max(8, h * 0.45),
    damage,
    knockback,
    sharpness,
    totalLength,
    color,
    seed: id * 41.7,
    state: 'FALLING',
    restTimer: 4.5,
    fadeTimer: 1.25,
    hitUnitIds: new Set(),
  };
}

export function drawFallingWeapon(
  ctx: CanvasRenderingContext2D,
  w: DrawnWeapon,
  boilTick: number,
) {
  const alpha = w.state === 'RESTING' && w.restTimer <= 0 ? Math.max(0, w.fadeTimer / 1.25) : 0.92;
  if (alpha <= 0.02) return;

  ctx.save();
  ctx.translate(w.x, w.y);
  ctx.rotate(w.angle);

  const pts = w.localPoints;
  const seed = w.seed + boilTick * 5.3;
  for (let i = 0; i < pts.length - 1; i++) {
    drawSketchLine(ctx, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, {
      color: w.color,
      lineWidth: 2.7,
      roughness: 1.15,
      seed: seed + i * 11.1,
      passes: 2,
      alpha,
    });
  }
  ctx.restore();
}

export interface PaperTear {
  x: number;
  y: number;
  width: number;
  life: number;
  maxLife: number;
  seed: number;
}

export function drawPaperTear(
  ctx: CanvasRenderingContext2D,
  tear: PaperTear,
  boilTick: number,
) {
  const alpha = tear.life < 1.2 ? Math.max(0, tear.life / 1.2) : 0.95;
  if (alpha <= 0.02) return;

  const half = tear.width * 0.5;
  const segments = 9;
  const topPts: Array<{ x: number; y: number }> = [];
  const botPts: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const px = tear.x - half + t * tear.width;
    const envelope = Math.sin(t * Math.PI);
    const gap = (3.5 + Math.abs(hash1D(tear.seed + i * 7.3)) * 5.5) * envelope;
    const jag = hash1D(tear.seed + i * 13.1) * 4.5 * envelope;
    topPts.push({ x: px, y: tear.y - gap + jag });
    botPts.push({ x: px, y: tear.y + gap + jag });
  }

  // Dark inner gap beneath torn notebook sheet
  ctx.save();
  ctx.globalAlpha = alpha * 0.72;
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(topPts[0].x, topPts[0].y);
  for (let i = 1; i < topPts.length; i++) ctx.lineTo(topPts[i].x, topPts[i].y);
  for (let i = botPts.length - 1; i >= 0; i--) ctx.lineTo(botPts[i].x, botPts[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Jagged ripped paper edge ink outlines + radiating paper creases
  const seed = tear.seed + boilTick * 0.1;
  for (let i = 0; i < segments; i++) {
    drawSketchLine(ctx, topPts[i].x, topPts[i].y, topPts[i + 1].x, topPts[i + 1].y, {
      color: '#1E293B',
      lineWidth: 2,
      roughness: 0.7,
      seed: seed + i * 3,
      passes: 1,
      alpha,
    });
    drawSketchLine(ctx, botPts[i].x, botPts[i].y, botPts[i + 1].x, botPts[i + 1].y, {
      color: '#475569',
      lineWidth: 1.7,
      roughness: 0.7,
      seed: seed + 50 + i * 3,
      passes: 1,
      alpha: alpha * 0.9,
    });
  }

  // Torn curl crease cracks branching off the rip
  for (let i = 0; i < 4; i++) {
    const cx = tear.x + hash1D(tear.seed + i * 19.7) * half * 0.75;
    const dir = i % 2 === 0 ? -1 : 1;
    drawSketchLine(
      ctx,
      cx,
      tear.y + dir * 2,
      cx + hash1D(tear.seed + i * 29.1) * 22,
      tear.y + dir * (10 + Math.abs(hash1D(tear.seed + i * 31)) * 12),
      {
        color: '#64748B',
        lineWidth: 1.4,
        roughness: 0.8,
        seed: seed + 90 + i,
        passes: 1,
        alpha: alpha * 0.75,
      },
    );
  }
}

export interface PinnedSpear {
  x: number;
  y: number;
  facing: 1 | -1;
  scale: number;
  life: number;
  maxLife: number;
  seed: number;
  style?: WeaponStyle;
}

export function drawPinnedSpear(
  ctx: CanvasRenderingContext2D,
  ps: PinnedSpear,
  timeSec: number,
) {
  const alpha = ps.life < 0.25 ? Math.max(0, ps.life / 0.25) : 0.95;
  if (alpha <= 0.02) return;

  const s = ps.scale;
  const st = ps.style ?? 'standard';
  const vibAmp = (ps.life / ps.maxLife) * 0.095;
  const vib = Math.sin(timeSec * 56 + ps.seed) * vibAmp;

  const baseAngle = ps.facing === 1 ? 0.56 : Math.PI - 0.56;
  const angle = baseAngle + vib;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const px = -dy;
  const py = dx;
  const tipX = ps.x + ps.facing * 8 * s;
  const tipY = ps.y;
  const tailX = tipX - dx * 64 * s;
  const tailY = tipY - dy * 64 * s;

  // Puncture cross tear on the paper at tip
  drawSketchLine(ctx, tipX - 6 * s, tipY - 3 * s, tipX + 6 * s, tipY + 3 * s, {
    color: '#334155',
    lineWidth: 1.6 * s,
    roughness: 0.6,
    seed: ps.seed + 1,
    passes: 1,
    alpha: alpha * 0.85,
  });
  drawSketchLine(ctx, tipX + 5 * s, tipY - 4 * s, tipX - 5 * s, tipY + 4 * s, {
    color: '#334155',
    lineWidth: 1.5 * s,
    roughness: 0.6,
    seed: ps.seed + 2,
    passes: 1,
    alpha: alpha * 0.85,
  });

  const shaftColor =
    st === 'hebongbay'
      ? '#7C3AED'
      : st === 'caokieu'
        ? '#15803D'
        : st === 'nhoc'
          ? '#EA580C'
          : st === 'ninja'
            ? '#0F172A'
            : st === 'bucon' || st === 'lonsat'
              ? '#475569'
              : '#78350F';

  const headColor =
    st === 'hebongbay'
      ? '#F59E0B'
      : st === 'ninja'
        ? '#7C3AED'
        : st === 'kysilon'
          ? '#DB2777'
          : st === 'nhoc'
            ? '#64748B'
            : '#DC2626';

  drawSketchLine(ctx, tailX, tailY, tipX - dx * 10 * s, tipY - dy * 10 * s, {
    color: shaftColor,
    lineWidth: (st === 'bucon' || st === 'lonsat' ? 3.1 : 2.5) * s,
    roughness: 0.7,
    seed: ps.seed + 3,
    passes: 2,
    alpha,
  });
  drawSketchLine(ctx, tipX - dx * 12 * s, tipY - dy * 12 * s, tipX, tipY, {
    color: headColor,
    lineWidth: 2.6 * s,
    roughness: 0.6,
    seed: ps.seed + 4,
    passes: 2,
    alpha,
  });

  // Character-distinct tip flourish
  if (st === 'nhoc') {
    const hbx = tipX - dx * 12 * s;
    const hby = tipY - dy * 12 * s;
    drawSketchLine(ctx, hbx - px * 7 * s, hby - py * 7 * s, hbx + px * 7 * s, hby + py * 7 * s, {
      color: '#334155',
      lineWidth: 2.2 * s,
      roughness: 0.5,
      seed: ps.seed + 10,
      passes: 1,
      alpha,
    });
  } else if (st === 'kysilon') {
    const hbx = tipX - dx * 14 * s;
    const hby = tipY - dy * 14 * s;
    drawSketchLine(ctx, hbx, hby, hbx - dx * 9 * s + px * 8 * s, hby - dy * 9 * s + py * 8 * s, {
      color: '#F472B6',
      lineWidth: 2.0 * s,
      roughness: 0.5,
      seed: ps.seed + 11,
      passes: 1,
      alpha,
    });
  } else if (st === 'hebongbay') {
    const midX = (tailX + tipX) * 0.5;
    const midY = (tailY + tipY) * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FEF9C3';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.6 * s;
    const bw = 42 * s;
    const bh = 16 * s;
    const bx = midX - bw * 0.5;
    const by = midY + 6 * s;
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.fill();
    ctx.stroke();
    ctx.font = `700 ${Math.round(10.5 * s)}px "Patrick Hand", sans-serif`;
    ctx.fillStyle = '#DC2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BANG!', midX, by + bh * 0.5 + 1);
    ctx.restore();
  }
}

export interface ThrownShuriken {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  omega: number;
  scale: number;
  ownerSide: 'left' | 'right';
  damage: number;
  life: number;
  maxLife: number;
  hasHit: boolean;
  hitOnce: true;
  blockable: true;
  seed: number;
}

let nextShurikenId = 1;

export function createThrownShuriken(
  x: number,
  y: number,
  vx: number,
  vy: number,
  scale: number,
  ownerSide: 'left' | 'right',
  damage = 7,
): ThrownShuriken {
  const id = nextShurikenId++;
  return {
    id,
    x,
    y,
    vx,
    vy,
    angle: 0,
    omega: (vx >= 0 ? 1 : -1) * 26,
    scale,
    ownerSide,
    damage,
    life: 1.6,
    maxLife: 1.6,
    hasHit: false,
    hitOnce: true,
    blockable: true,
    seed: 910 + id * 29.7,
  };
}

export function drawThrownShuriken(
  ctx: CanvasRenderingContext2D,
  sh: ThrownShuriken,
  boilTick: number,
) {
  if (sh.hasHit || sh.life <= 0) return;
  const s = sh.scale;
  const seed = sh.seed + boilTick * 5.3;
  const spd = Math.hypot(sh.vx, sh.vy) || 1;
  const dirX = sh.vx / spd;
  const dirY = sh.vy / spd;

  // Pencil streak behind the flying shuriken
  for (let i = 0; i < 2; i++) {
    const offPerp = (i === 0 ? -1 : 1) * 3.8 * s;
    const perpX = -dirY * offPerp;
    const perpY = dirX * offPerp;
    const startOff = 10 * s;
    const endOff = (28 + i * 7) * s;
    drawSketchLine(
      ctx,
      sh.x - dirX * startOff + perpX,
      sh.y - dirY * startOff + perpY,
      sh.x - dirX * endOff + perpX,
      sh.y - dirY * endOff + perpY,
      {
        color: i === 0 ? '#7C3AED' : '#475569',
        lineWidth: 1.5 * s,
        roughness: 0.45,
        seed: seed + 30 + i,
        passes: 1,
        alpha: 0.8,
      },
    );
  }

  const r = 9.5 * s;
  ctx.save();
  ctx.translate(sh.x, sh.y);
  ctx.rotate(sh.angle);

  // 4-point purple/dark-ink star blades
  const pts: Array<{ x: number; y: number }> = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const rad = k % 2 === 0 ? r : r * 0.34;
    pts.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad });
  }
  pts.push(pts[0]);

  ctx.fillStyle = '#7C3AED';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let k = 1; k < pts.length; k++) {
    ctx.lineTo(pts[k].x, pts[k].y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  drawSketchPolyline(ctx, pts, {
    color: '#0F172A',
    lineWidth: 1.55 * s,
    roughness: 0.35,
    seed: seed + 1,
    passes: 1,
    alpha: 0.96,
  });

  drawSketchCircle(ctx, 0, 0, 1.9 * s, {
    color: '#7C3AED',
    lineWidth: 1.3 * s,
    roughness: 0.25,
    seed: seed + 5,
    passes: 1,
    alpha: 0.96,
  });

  ctx.restore();
}

