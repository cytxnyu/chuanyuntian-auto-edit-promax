import React, {type ComponentType} from 'react';
import {VisualThemeProvider} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/visual-theme';
import {CrashImpactReal as ShotcraftBulk0} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/crash-zoom-punch/CrashImpactReal';
import {CrashZoomReal as ShotcraftBulk1} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/crash-zoom-punch/CrashZoomReal';
import {CursorFlyover as ShotcraftBulk2} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/cursor-flyover/CursorFlyover';
import {DollyZoomReal as ShotcraftBulk3} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/depth-layer-moves/DollyZoomReal';
import {MultiplaneReal as ShotcraftBulk4} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/depth-layer-moves/MultiplaneReal';
import {GrazeFaceTour as ShotcraftBulk5} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/graze-face-tour/GrazeFaceTour';
import {OverheadTabletopDrop as ShotcraftBulk6} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/overhead-camera-moves/OverheadTabletopDrop';
import {TiltReveal as ShotcraftBulk7} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/overhead-camera-moves/TiltReveal';
import {DroneDiveLanding as ShotcraftBulk8} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/space-camera-moves/DroneDiveLanding';
import {ExplodedView as ShotcraftBulk9} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/space-camera-moves/ExplodedView';
import {SteepTiltGlide as ShotcraftBulk10} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/steep-tilt-glide/SteepTiltGlide';
import {BulletTimeFreezeOrbit as ShotcraftBulk11} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/tension-camera-moves/BulletTimeFreezeOrbit';
import {DutchRollToLevel as ShotcraftBulk12} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/tension-camera-moves/DutchRollToLevel';
import {PullBackIsolation as ShotcraftBulk13} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/tension-camera-moves/PullBackIsolation';
import {SlowPushIn as ShotcraftBulk14} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/camera/tension-camera-moves/SlowPushIn';
import {AvatarGridRadialBuildColorize as ShotcraftBulk15} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/avatar-grid-radial-build-colorize/AvatarGridRadialBuildColorize';
import {BeforeAfterSliderScrub as ShotcraftBulk16} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/before-after-slider-scrub/BeforeAfterSliderScrub';
import {AxisRescaleShockV2 as ShotcraftBulk17} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/chart-live-moves/AxisRescaleShockV2';
import {OscilloscopeStreamV2 as ShotcraftBulk18} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/chart-live-moves/OscilloscopeStreamV2';
import {UnitDotSwarmRegroupV2 as ShotcraftBulk19} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/chart-live-moves/UnitDotSwarmRegroupV2';
import {CounterConfetti as ShotcraftBulk20} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/counter-confetti/CounterConfetti';
import {CycleGlassNodeMorph as ShotcraftBulk21} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/cycle-glass-node-morph/CycleGlassNodeMorph';
import {NeedleSweepSelftest as ShotcraftBulk22} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/gauge-readout-moves/NeedleSweepSelftest';
import {TapeScrollFixedPointer as ShotcraftBulk23} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/gauge-readout-moves/TapeScrollFixedPointer';
import {HatchDepth as ShotcraftBulk24} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/hatch-depth/HatchDepth';
import {OdometerDigitRoll as ShotcraftBulk25} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/odometer-digit-roll/OdometerDigitRoll';
import {ConfettiCrossfire as ShotcraftBulk26} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/particle-celebrate-hits/ConfettiCrossfire';
import {CounterTickSparks as ShotcraftBulk27} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/particle-celebrate-hits/CounterTickSparks';
import {ParticleSandFill as ShotcraftBulk28} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/particle-sand-fill/ParticleSandFill';
import {RingDiagramAnnotationReveal as ShotcraftBulk29} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/ring-diagram-annotation-reveal/RingDiagramAnnotationReveal';
import {BrakeReticleLock as ShotcraftBulk30} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/scroll-brake-moves/BrakeReticleLock';
import {ChangelogScrollBrake as ShotcraftBulk31} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/scroll-brake-moves/ChangelogScrollBrake';
import {TimelineTravel as ShotcraftBulk32} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/data/timeline-travel/TimelineTravel';
import {AssembleThenTypeFlyin as ShotcraftBulk33} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/assemble-then-type-flyin/AssembleThenTypeFlyin';
import {AuroraBloomBgFlip as ShotcraftBulk34} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/aurora-bloom-bg-flip/AuroraBloomBgFlip';
import {BrandFrameSnap as ShotcraftBulk35} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/brand-frame-snap/BrandFrameSnap';
import {DashboardGlowHighlightPill as ShotcraftBulk36} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/dashboard-glow-highlight-pill/DashboardGlowHighlightPill';
import {LineUnfoldPanel as ShotcraftBulk37} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/fui-hud-moves/LineUnfoldPanel';
import {ReticleLockOn as ShotcraftBulk38} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/fui-hud-moves/ReticleLockOn';
import {FlylineArc as ShotcraftBulk39} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/glow-flyline-moves/FlylineArc';
import {GlowOrbAmbient as ShotcraftBulk40} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/glow-flyline-moves/GlowOrbAmbient';
import {OrbFlylineRelay as ShotcraftBulk41} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/glow-flyline-moves/OrbFlylineRelay';
import {AttentionBounce as ShotcraftBulk42} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/icon-performance-moves/AttentionBounce';
import {PopBurstConfirm as ShotcraftBulk43} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/icon-performance-moves/PopBurstConfirm';
import {AnimeImpact as ShotcraftBulk44} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/impact-feedback/AnimeImpact';
import {HitCounter as ShotcraftBulk45} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/impact-feedback/HitCounter';
import {HalationBloom as ShotcraftBulk46} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/light-play-moves/HalationBloom';
import {SheenSweepRetry as ShotcraftBulk47} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/light-play-moves/SheenSweepRetry';
import {SpotlightSweepReveal as ShotcraftBulk48} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/light-play-moves/SpotlightSweepReveal';
import {LineBoil as ShotcraftBulk49} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/line-boil/LineBoil';
import {RadialRipplePhoneChips as ShotcraftBulk50} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/radial-ripple-phone-chips/RadialRipplePhoneChips';
import {RisoBeatPump as ShotcraftBulk51} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/riso-print-hits/RisoBeatPump';
import {RisoMisregistrationHit as ShotcraftBulk52} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/riso-print-hits/RisoMisregistrationHit';
import {ScanBracketSweep as ShotcraftBulk53} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/scan-bracket-sweep/ScanBracketSweep';
import {ScanlineAnnotateFocus as ShotcraftBulk54} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/scanline-annotate-focus/ScanlineAnnotateFocus';
import {ScanlineAssembleFlyin as ShotcraftBulk55} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/scanline-assemble-flyin/ScanlineAssembleFlyin';
import {ImpactBurstKit as ShotcraftBulk56} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/slam-entrance-moves/ImpactBurstKit';
import {KanadaPerspectiveSnap as ShotcraftBulk57} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/slam-entrance-moves/KanadaPerspectiveSnap';
import {ScoreSlam as ShotcraftBulk58} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/slam-entrance-moves/ScoreSlam';
import {CornerSpotlightReveal as ShotcraftBulk59} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/spotlight-sweep-moves/CornerSpotlightReveal';
import {GlowWakeSleepPanel as ShotcraftBulk60} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/spotlight-sweep-moves/GlowWakeSleepPanel';
import {SlideSpotlightPan as ShotcraftBulk61} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/effects/spotlight-sweep-moves/SlideSpotlightPan';
import {StreamResponse as ShotcraftBulk62} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/ai-stream-response/StreamResponse';
import {AutolayoutGapDial as ShotcraftBulk63} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/autolayout-gap-dial/AutolayoutGapDial';
import {DiagramCascadeBuild as ShotcraftBulk64} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/canvas-materialize-moves/DiagramCascadeBuild';
import {PanelToCanvasMaterialize as ShotcraftBulk65} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/canvas-materialize-moves/PanelToCanvasMaterialize';
import {ChipGridSingleSelectBlackout as ShotcraftBulk66} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/chip-grid-single-select-blackout/ChipGridSingleSelectBlackout';
import {ChipLiftToUserPill as ShotcraftBulk67} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/chip-lift-to-user-pill/ChipLiftToUserPill';
import {CursorCastEnsemble as ShotcraftBulk68} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/collab-cursor-moves/CursorCastEnsemble';
import {CursorDialogueDuet as ShotcraftBulk69} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/collab-cursor-moves/CursorDialogueDuet';
import {CommandPaletteSummon as ShotcraftBulk70} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/command-palette-summon/CommandPaletteSummon';
import {GlassPillDictationTyping as ShotcraftBulk71} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/glass-pill-dictation-typing/GlassPillDictationTyping';
import {HashtagToPillMaterialize as ShotcraftBulk72} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/hashtag-to-pill-materialize/HashtagToPillMaterialize';
import {CursorPerformancePunchIn as ShotcraftBulk73} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/input-trigger-moves/CursorPerformancePunchIn';
import {KeycapSmashCut as ShotcraftBulk74} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/input-trigger-moves/KeycapSmashCut';
import {PickerCarouselFeatureCycle as ShotcraftBulk75} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/picker-carousel-feature-cycle/PickerCarouselFeatureCycle';
import {SegmentedThumbHero as ShotcraftBulk76} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/segmented-thumb-hero/SegmentedThumbHero';
import {PaletteThemeRipple as ShotcraftBulk77} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/theme-switch-moves/PaletteThemeRipple';
import {ThemeSweepToggle as ShotcraftBulk78} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/theme-switch-moves/ThemeSweepToggle';
import {TypeAndFilter as ShotcraftBulk79} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/type-and-filter/TypeAndFilter';
import {VoiceWaveformLive as ShotcraftBulk80} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/interaction/voice-waveform-live/VoiceWaveformLive';
import {CraneRiseReveal as ShotcraftBulk81} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/crane-rise-reveal/CraneRiseReveal';
import {DatavizLandscapeOpen as ShotcraftBulk82} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/dataviz-landscape-open/DatavizLandscapeOpen';
import {Fracture as ShotcraftBulk83} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/fracture/Fracture';
import {IconFieldColorize as ShotcraftBulk84} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/icon-field-colorize/IconFieldColorize';
import {LetterspaceMaterialize as ShotcraftBulk85} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/letterspace-materialize/LetterspaceMaterialize';
import {MagicianCardFlourish as ShotcraftBulk86} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/magician-card-flourish/MagicianCardFlourish';
import {OrbitRingTitleOpen as ShotcraftBulk87} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/orbit-ring-title-open/OrbitRingTitleOpen';
import {SpotlightHeroCard as ShotcraftBulk88} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/spotlight-hero-card/SpotlightHeroCard';
import {StrokeSegmentBuild as ShotcraftBulk89} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/stroke-segment-build/StrokeSegmentBuild';
import {TextAsMask as ShotcraftBulk90} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/opening/text-as-mask/TextAsMask';
import {LogoStingButton as ShotcraftBulk91} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/edit-hook-moves/LogoStingButton';
import {GrainDissolve as ShotcraftBulk92} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/grain-dissolve/GrainDissolve';
import {LogoShrinkWordmarkLockup as ShotcraftBulk93} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup';
import {NeonTripleMarquee as ShotcraftBulk94} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/neon-triple-marquee/NeonTripleMarquee';
import {OutroGroupPhotoLaunch as ShotcraftBulk95} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/outro-group-photo-launch/OutroGroupPhotoLaunch';
import {UiStripAwayOutro as ShotcraftBulk96} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/ui-strip-away-outro/UiStripAwayOutro';
import {IconFlipBloomLogo as ShotcraftBulk97} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/ui-to-brand-morph/IconFlipBloomLogo';
import {InputMorphsIntoLogo as ShotcraftBulk98} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/outro/ui-to-brand-morph/InputMorphsIntoLogo';
import {BeatCutAccelerando as ShotcraftBulk99} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/beat-cut-moves/BeatCutAccelerando';
import {PaparazziFlash as ShotcraftBulk100} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/beat-cut-moves/PaparazziFlash';
import {BeatStepListThemeCycle as ShotcraftBulk101} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/beat-step-list-theme-cycle/BeatStepListThemeCycle';
import {DominoCascade as ShotcraftBulk102} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/montage-rhythm-moves/DominoCascade';
import {DropBlackoutSlam as ShotcraftBulk103} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/montage-rhythm-moves/DropBlackoutSlam';
import {WrightTripleCut as ShotcraftBulk104} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/montage-rhythm-moves/WrightTripleCut';
import {ComicPanelSplit as ShotcraftBulk105} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/panel-grid-moves/ComicPanelSplit';
import {FlipGridReflow as ShotcraftBulk106} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/panel-grid-moves/FlipGridReflow';
import {GridFlashMosaic as ShotcraftBulk107} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/panel-grid-moves/GridFlashMosaic';
import {QuadSplitParallelScenes as ShotcraftBulk108} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/quad-split-parallel-scenes/QuadSplitParallelScenes';
import {JumpCutPunchIn as ShotcraftBulk109} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/rhythm-interrupt-moves/JumpCutPunchIn';
import {StrobeBlackFrames as ShotcraftBulk110} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/rhythm-interrupt-moves/StrobeBlackFrames';
import {SakugaTimingShift as ShotcraftBulk111} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/sakuga-timing-shift/SakugaTimingShift';
import {SmearMultiples as ShotcraftBulk112} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/smear-multiples/SmearMultiples';
import {SpectrumMorphUi as ShotcraftBulk113} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/spectrum-morph-ui/SpectrumMorphUi';
import {FreezeAnnotateReal as ShotcraftBulk114} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/speed-ramp-freeze/FreezeAnnotateReal';
import {SpeedRampReal as ShotcraftBulk115} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/speed-ramp-freeze/SpeedRampReal';
import {CardFootageCadence as ShotcraftBulk116} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/trailer-grammar-moves/CardFootageCadence';
import {SmashCut as ShotcraftBulk117} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/trailer-grammar-moves/SmashCut';
import {TrailerBumper as ShotcraftBulk118} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/rhythm/trailer-grammar-moves/TrailerBumper';
import {BottomPushStackWipe as ShotcraftBulk119} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/bottom-push-stack-wipe/BottomPushStackWipe';
import {BubbleSwarmTakeover as ShotcraftBulk120} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/bubble-swarm-takeover/BubbleSwarmTakeover';
import {CardFlipReveal as ShotcraftBulk121} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/card-flip-reveal/CardFlipReveal';
import {CardFlockTumble as ShotcraftBulk122} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/card-flock-tumble/CardFlockTumble';
import {CircleMatchIris as ShotcraftBulk123} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/circle-match-iris/CircleMatchIris';
import {ColorBlockStepWipe as ShotcraftBulk124} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/color-block-step-wipe/ColorBlockStepWipe';
import {CubeNavigation as ShotcraftBulk125} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/cube-navigation/CubeNavigation';
import {GradientTransition as ShotcraftBulk126} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/gradient-transition/GradientTransition';
import {LineCarryTransition as ShotcraftBulk127} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/line-carry-transition/LineCarryTransition';
import {MosaicReframe as ShotcraftBulk128} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/mosaic-reframe/MosaicReframe';
import {BarnDoorSplit as ShotcraftBulk129} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/page-turn-transitions/BarnDoorSplit';
import {CubeRotate as ShotcraftBulk130} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/page-turn-transitions/CubeRotate';
import {PaperPlaneMessenger as ShotcraftBulk131} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/paper-plane-messenger/PaperPlaneMessenger';
import {InkBleedReveal as ShotcraftBulk132} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/print-texture-transitions/InkBleedReveal';
import {BlackCardTransition as ShotcraftBulk133} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/BlackCardTransition';
import {DarkTunnelTransition as ShotcraftBulk134} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/DarkTunnelTransition';
import {FocusHandoffTransition as ShotcraftBulk135} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/FocusHandoffTransition';
import {MaskWipeReal as ShotcraftBulk136} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/MaskWipeReal';
import {PortalWipeV2 as ShotcraftBulk137} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/PortalWipeV2';
import {WhipBrakeReal as ShotcraftBulk138} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/WhipBrakeReal';
import {WhipPanReal as ShotcraftBulk139} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/shot-transitions/WhipPanReal';
import {GlitchDisplace as ShotcraftBulk140} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/tear-streak-transitions/GlitchDisplace';
import {InvisibleCut as ShotcraftBulk141} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/transition-hidden-cut/InvisibleCut';
import {LightLeakBurn as ShotcraftBulk142} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/transition-hidden-cut/LightLeakBurn';
import {VersusSlam as ShotcraftBulk143} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/transition-hidden-cut/VersusSlam';
import {LetterformZoom as ShotcraftBulk144} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/transition-travel/LetterformZoom';
import {SharedElementMorph as ShotcraftBulk145} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/transition-travel/SharedElementMorph';
import {WhiteFlashLogoSimplifyCut as ShotcraftBulk146} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/white-flash-logo-simplify-cut/WhiteFlashLogoSimplifyCut';
import {BlindsSlice as ShotcraftBulk147} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/wipe-transitions/BlindsSlice';
import {ClockWipe as ShotcraftBulk148} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/transition/wipe-transitions/ClockWipe';
import {BlurSlide as ShotcraftBulk149} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/blur-slide/BlurSlide';
import {BraceExpand as ShotcraftBulk150} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/brace-expand/BraceExpand';
import {BrandInkOpen as ShotcraftBulk151} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/brand-ink-open/BrandInkOpen';
import {CelFlashStomp as ShotcraftBulk152} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/cel-flash-stomp/CelFlashStomp';
import {CountdownArcScatter as ShotcraftBulk153} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/countdown-arc-scatter/CountdownArcScatter';
import {FlyingWords as ShotcraftBulk154} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/flying-words/FlyingWords';
import {GlitchCycle as ShotcraftBulk155} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/glitch-cycle/GlitchCycle';
import {GradientWordSweep as ShotcraftBulk156} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/gradient-word-sweep/GradientWordSweep';
import {LeadWordZoomAssemble as ShotcraftBulk157} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/lead-word-zoom-assemble/LeadWordZoomAssemble';
import {MarkerUnderlineTitle as ShotcraftBulk158} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/marker-underline-title/MarkerUnderlineTitle';
import {OutlineWordFill as ShotcraftBulk159} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/outline-word-fill/OutlineWordFill';
import {PaperTitleCard as ShotcraftBulk160} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/paper-title-card/PaperTitleCard';
import {PillChipSlotCycleHandled as ShotcraftBulk161} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/pill-chip-slot-cycle-handled/PillChipSlotCycleHandled';
import {PillSlotCycle as ShotcraftBulk162} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/pill-slot-cycle/PillSlotCycle';
import {Scramble as ShotcraftBulk163} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/scramble/Scramble';
import {SplitFlapFlip as ShotcraftBulk164} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/split-flap-title/SplitFlapFlip';
import {TextColumnConverge as ShotcraftBulk165} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/text-column-converge/TextColumnConverge';
import {TitleDemoteToLabel as ShotcraftBulk166} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/title-demote-to-label/TitleDemoteToLabel';
import {LetterformDriftAssembly as ShotcraftBulk167} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-assembly-moves/LetterformDriftAssembly';
import {SplitTextStagger as ShotcraftBulk168} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-assembly-moves/SplitTextStagger';
import {TextOnPath as ShotcraftBulk169} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-assembly-moves/TextOnPath';
import {TrackingExpandReveal as ShotcraftBulk170} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-assembly-moves/TrackingExpandReveal';
import {LetterDropPhysics as ShotcraftBulk171} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-entrance-moves/LetterDropPhysics';
import {ScrambleDecode as ShotcraftBulk172} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-entrance-moves/ScrambleDecode';
import {FontWeightPump as ShotcraftBulk173} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-rhythm-sync/FontWeightPump';
import {KaraokeFillSync as ShotcraftBulk174} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/type-rhythm-sync/KaraokeFillSync';
import {TerminalTypewriter as ShotcraftBulk175} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/typewriter-moves/TerminalTypewriter';
import {TypewriterErrorRetype as ShotcraftBulk176} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/typewriter-moves/TypewriterErrorRetype';
import {TypingCodeBlock as ShotcraftBulk177} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/typing-code-block/TypingCodeBlock';
import {VerticalWordRollBlurCycle as ShotcraftBulk178} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/vertical-word-roll-blur-cycle/VerticalWordRollBlurCycle';
import {WordRelayFilmstrip as ShotcraftBulk179} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/word-relay-filmstrip/WordRelayFilmstrip';
import {WordRelayGeometry as ShotcraftBulk180} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/typography/word-relay-geometry/WordRelayGeometry';
import {AvatarBracketCarousel as ShotcraftBulk181} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/avatar-bracket-carousel/AvatarBracketCarousel';
import {BezierSourceConvergeMerge as ShotcraftBulk182} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/bezier-source-converge-merge/BezierSourceConvergeMerge';
import {CardStack as ShotcraftBulk183} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/card-stack/CardStack';
import {Carousel3D as ShotcraftBulk184} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/carousel-3d/Carousel3D';
import {ClipCardLooping as ShotcraftBulk185} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/clipcard-looping/ClipCardLooping';
import {ClonerDepthEcho as ShotcraftBulk186} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/cloner-depth-echo/ClonerDepthEcho';
import {DeckDealFlyin as ShotcraftBulk187} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/deck-deal-flyin/DeckDealFlyin';
import {DocParkLeftPillDeal as ShotcraftBulk188} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/doc-park-left-pill-deal/DocParkLeftPillDeal';
import {DocumentTypewriterReveal as ShotcraftBulk189} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/document-typewriter-reveal/DocumentTypewriterReveal';
import {DrawSvgTrace as ShotcraftBulk190} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/draw-svg-trace/DrawSvgTrace';
import {AxialStretch as ShotcraftBulk191} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/element-body-moves/AxialStretch';
import {ContactShadowLift as ShotcraftBulk192} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/element-body-moves/ContactShadowLift';
import {FloatingGlossyLabelPills as ShotcraftBulk193} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/floating-glossy-label-pills/FloatingGlossyLabelPills';
import {IntegrationHubMap as ShotcraftBulk194} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/integration-hub-map/IntegrationHubMap';
import {ListReveal as ShotcraftBulk195} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/list-reveal/ListReveal';
import {ListStackPress as ShotcraftBulk196} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/list-stack-press/ListStackPress';
import {MorphFromPrimitive as ShotcraftBulk197} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/morph-from-primitive/MorphFromPrimitive';
import {NeonFrameForerun as ShotcraftBulk198} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/neon-frame-forerun/NeonFrameForerun';
import {NeonFrameForerunOrbit as ShotcraftBulk199} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/neon-frame-orbit-drop/NeonFrameForerunOrbit';
import {PageWaterfallWall as ShotcraftBulk200} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/page-waterfall-wall/PageWaterfallWall';
import {MaskingTapeSlap as ShotcraftBulk201} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/paper-craft-moves/MaskingTapeSlap';
import {PopupBookRise as ShotcraftBulk202} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/paper-craft-moves/PopupBookRise';
import {PlatformHingeRise as ShotcraftBulk203} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/platform-hinge-rise/PlatformHingeRise';
import {ProductCardProgressiveAssemble as ShotcraftBulk204} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/product-card-progressive-assemble/ProductCardProgressiveAssemble';
import {RadialWave as ShotcraftBulk205} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/radial-wave/RadialWave';
import {ResearchCardStackScroll as ShotcraftBulk206} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/research-card-stack-scroll/ResearchCardStackScroll';
import {RowEmbed as ShotcraftBulk207} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/row-embed/RowEmbed';
import {RunwayGroundSkim as ShotcraftBulk208} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/runway-ground-skim/RunwayGroundSkim';
import {SkeletonReveal as ShotcraftBulk209} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/skeleton-reveal/SkeletonReveal';
import {SvgShapeMorph as ShotcraftBulk210} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/svg-shape-morph/SvgShapeMorph';
import {ValueStaggerGradient as ShotcraftBulk211} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/value-stagger-gradient/ValueStaggerGradient';
import {BentoLightUp as ShotcraftBulk212} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/wall-reveal-moves/BentoLightUp';
import {GridWaveFlip as ShotcraftBulk213} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/wall-reveal-moves/GridWaveFlip';
import {WireframeDrawOn as ShotcraftBulk214} from '../../../../../vendor/video-shotcraft/bulk-runtime/demos/ui-entrance/wall-reveal-moves/WireframeDrawOn';
import {SceneOpen as ShotcraftBulk215} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/aifl/live/SceneOpen';
import {SceneFlyIn as ShotcraftBulk216} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/aifl/live/SceneFlyIn';
import {SceneDetail as ShotcraftBulk217} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/aifl/live/SceneDetail';
import {ScenePapers as ShotcraftBulk218} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/aifl/live/ScenePapers';
import {SceneWbr as ShotcraftBulk219} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/aifl/live/SceneWbr';
import {TitleCardUnit as ShotcraftBulk220} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/workbench';
import {CaptionUnit as ShotcraftBulk221} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/workbench';
import {FlashUnit as ShotcraftBulk222} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/workbench';
import {ThemedFilm as ShotcraftBulk223} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk224} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk225} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk226} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk227} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk228} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk229} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';
import {ThemedFilm as ShotcraftBulk230} from '../../../../../vendor/video-shotcraft/bulk-runtime/template/src/themes/ThemedFilm';

// Generated from actual exports. No dependency fixtures/diagnostic views are counted as complete shots.
export const shotcraftBulkComponents: Record<string, ComponentType<any>> = {
  "video-shotcraft/bulk/camera/crash-zoom-punch/crashimpactreal/crashimpactreal": ShotcraftBulk0 as ComponentType<any>,
  "video-shotcraft/bulk/camera/crash-zoom-punch/crashzoomreal/crashzoomreal": ShotcraftBulk1 as ComponentType<any>,
  "video-shotcraft/bulk/camera/cursor-flyover/cursorflyover/cursorflyover": ShotcraftBulk2 as ComponentType<any>,
  "video-shotcraft/bulk/camera/depth-layer-moves/dollyzoomreal/dollyzoomreal": ShotcraftBulk3 as ComponentType<any>,
  "video-shotcraft/bulk/camera/depth-layer-moves/multiplanereal/multiplanereal": ShotcraftBulk4 as ComponentType<any>,
  "video-shotcraft/bulk/camera/graze-face-tour/grazefacetour/grazefacetour": ShotcraftBulk5 as ComponentType<any>,
  "video-shotcraft/bulk/camera/overhead-camera-moves/overheadtabletopdrop/overheadtabletopdrop": ShotcraftBulk6 as ComponentType<any>,
  "video-shotcraft/bulk/camera/overhead-camera-moves/tiltreveal/tiltreveal": ShotcraftBulk7 as ComponentType<any>,
  "video-shotcraft/bulk/camera/space-camera-moves/dronedivelanding/dronedivelanding": ShotcraftBulk8 as ComponentType<any>,
  "video-shotcraft/bulk/camera/space-camera-moves/explodedview/explodedview": ShotcraftBulk9 as ComponentType<any>,
  "video-shotcraft/bulk/camera/steep-tilt-glide/steeptiltglide/steeptiltglide": ShotcraftBulk10 as ComponentType<any>,
  "video-shotcraft/bulk/camera/tension-camera-moves/bullettimefreezeorbit/bullettimefreezeorbit": ShotcraftBulk11 as ComponentType<any>,
  "video-shotcraft/bulk/camera/tension-camera-moves/dutchrolltolevel/dutchrolltolevel": ShotcraftBulk12 as ComponentType<any>,
  "video-shotcraft/bulk/camera/tension-camera-moves/pullbackisolation/pullbackisolation": ShotcraftBulk13 as ComponentType<any>,
  "video-shotcraft/bulk/camera/tension-camera-moves/slowpushin/slowpushin": ShotcraftBulk14 as ComponentType<any>,
  "video-shotcraft/bulk/data/avatar-grid-radial-build-colorize/avatargridradialbuildcolorize/avatargridradialbuildcolorize": ShotcraftBulk15 as ComponentType<any>,
  "video-shotcraft/bulk/data/before-after-slider-scrub/beforeaftersliderscrub/beforeaftersliderscrub": ShotcraftBulk16 as ComponentType<any>,
  "video-shotcraft/bulk/data/chart-live-moves/axisrescaleshockv2/axisrescaleshockv2": ShotcraftBulk17 as ComponentType<any>,
  "video-shotcraft/bulk/data/chart-live-moves/oscilloscopestreamv2/oscilloscopestreamv2": ShotcraftBulk18 as ComponentType<any>,
  "video-shotcraft/bulk/data/chart-live-moves/unitdotswarmregroupv2/unitdotswarmregroupv2": ShotcraftBulk19 as ComponentType<any>,
  "video-shotcraft/bulk/data/counter-confetti/counterconfetti/counterconfetti": ShotcraftBulk20 as ComponentType<any>,
  "video-shotcraft/bulk/data/cycle-glass-node-morph/cycleglassnodemorph/cycleglassnodemorph": ShotcraftBulk21 as ComponentType<any>,
  "video-shotcraft/bulk/data/gauge-readout-moves/needlesweepselftest/needlesweepselftest": ShotcraftBulk22 as ComponentType<any>,
  "video-shotcraft/bulk/data/gauge-readout-moves/tapescrollfixedpointer/tapescrollfixedpointer": ShotcraftBulk23 as ComponentType<any>,
  "video-shotcraft/bulk/data/hatch-depth/hatchdepth/hatchdepth": ShotcraftBulk24 as ComponentType<any>,
  "video-shotcraft/bulk/data/odometer-digit-roll/odometerdigitroll/odometerdigitroll": ShotcraftBulk25 as ComponentType<any>,
  "video-shotcraft/bulk/data/particle-celebrate-hits/confetticrossfire/confetticrossfire": ShotcraftBulk26 as ComponentType<any>,
  "video-shotcraft/bulk/data/particle-celebrate-hits/counterticksparks/counterticksparks": ShotcraftBulk27 as ComponentType<any>,
  "video-shotcraft/bulk/data/particle-sand-fill/particlesandfill/particlesandfill": ShotcraftBulk28 as ComponentType<any>,
  "video-shotcraft/bulk/data/ring-diagram-annotation-reveal/ringdiagramannotationreveal/ringdiagramannotationreveal": ShotcraftBulk29 as ComponentType<any>,
  "video-shotcraft/bulk/data/scroll-brake-moves/brakereticlelock/brakereticlelock": ShotcraftBulk30 as ComponentType<any>,
  "video-shotcraft/bulk/data/scroll-brake-moves/changelogscrollbrake/changelogscrollbrake": ShotcraftBulk31 as ComponentType<any>,
  "video-shotcraft/bulk/data/timeline-travel/timelinetravel/timelinetravel": ShotcraftBulk32 as ComponentType<any>,
  "video-shotcraft/bulk/effects/assemble-then-type-flyin/assemblethentypeflyin/assemblethentypeflyin": ShotcraftBulk33 as ComponentType<any>,
  "video-shotcraft/bulk/effects/aurora-bloom-bg-flip/aurorabloombgflip/aurorabloombgflip": ShotcraftBulk34 as ComponentType<any>,
  "video-shotcraft/bulk/effects/brand-frame-snap/brandframesnap/brandframesnap": ShotcraftBulk35 as ComponentType<any>,
  "video-shotcraft/bulk/effects/dashboard-glow-highlight-pill/dashboardglowhighlightpill/dashboardglowhighlightpill": ShotcraftBulk36 as ComponentType<any>,
  "video-shotcraft/bulk/effects/fui-hud-moves/lineunfoldpanel/lineunfoldpanel": ShotcraftBulk37 as ComponentType<any>,
  "video-shotcraft/bulk/effects/fui-hud-moves/reticlelockon/reticlelockon": ShotcraftBulk38 as ComponentType<any>,
  "video-shotcraft/bulk/effects/glow-flyline-moves/flylinearc/flylinearc": ShotcraftBulk39 as ComponentType<any>,
  "video-shotcraft/bulk/effects/glow-flyline-moves/gloworbambient/gloworbambient": ShotcraftBulk40 as ComponentType<any>,
  "video-shotcraft/bulk/effects/glow-flyline-moves/orbflylinerelay/orbflylinerelay": ShotcraftBulk41 as ComponentType<any>,
  "video-shotcraft/bulk/effects/icon-performance-moves/attentionbounce/attentionbounce": ShotcraftBulk42 as ComponentType<any>,
  "video-shotcraft/bulk/effects/icon-performance-moves/popburstconfirm/popburstconfirm": ShotcraftBulk43 as ComponentType<any>,
  "video-shotcraft/bulk/effects/impact-feedback/animeimpact/animeimpact": ShotcraftBulk44 as ComponentType<any>,
  "video-shotcraft/bulk/effects/impact-feedback/hitcounter/hitcounter": ShotcraftBulk45 as ComponentType<any>,
  "video-shotcraft/bulk/effects/light-play-moves/halationbloom/halationbloom": ShotcraftBulk46 as ComponentType<any>,
  "video-shotcraft/bulk/effects/light-play-moves/sheensweepretry/sheensweepretry": ShotcraftBulk47 as ComponentType<any>,
  "video-shotcraft/bulk/effects/light-play-moves/spotlightsweepreveal/spotlightsweepreveal": ShotcraftBulk48 as ComponentType<any>,
  "video-shotcraft/bulk/effects/line-boil/lineboil/lineboil": ShotcraftBulk49 as ComponentType<any>,
  "video-shotcraft/bulk/effects/radial-ripple-phone-chips/radialripplephonechips/radialripplephonechips": ShotcraftBulk50 as ComponentType<any>,
  "video-shotcraft/bulk/effects/riso-print-hits/risobeatpump/risobeatpump": ShotcraftBulk51 as ComponentType<any>,
  "video-shotcraft/bulk/effects/riso-print-hits/risomisregistrationhit/risomisregistrationhit": ShotcraftBulk52 as ComponentType<any>,
  "video-shotcraft/bulk/effects/scan-bracket-sweep/scanbracketsweep/scanbracketsweep": ShotcraftBulk53 as ComponentType<any>,
  "video-shotcraft/bulk/effects/scanline-annotate-focus/scanlineannotatefocus/scanlineannotatefocus": ShotcraftBulk54 as ComponentType<any>,
  "video-shotcraft/bulk/effects/scanline-assemble-flyin/scanlineassembleflyin/scanlineassembleflyin": ShotcraftBulk55 as ComponentType<any>,
  "video-shotcraft/bulk/effects/slam-entrance-moves/impactburstkit/impactburstkit": ShotcraftBulk56 as ComponentType<any>,
  "video-shotcraft/bulk/effects/slam-entrance-moves/kanadaperspectivesnap/kanadaperspectivesnap": ShotcraftBulk57 as ComponentType<any>,
  "video-shotcraft/bulk/effects/slam-entrance-moves/scoreslam/scoreslam": ShotcraftBulk58 as ComponentType<any>,
  "video-shotcraft/bulk/effects/spotlight-sweep-moves/cornerspotlightreveal/cornerspotlightreveal": ShotcraftBulk59 as ComponentType<any>,
  "video-shotcraft/bulk/effects/spotlight-sweep-moves/glowwakesleeppanel/glowwakesleeppanel": ShotcraftBulk60 as ComponentType<any>,
  "video-shotcraft/bulk/effects/spotlight-sweep-moves/slidespotlightpan/slidespotlightpan": ShotcraftBulk61 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/ai-stream-response/streamresponse/streamresponse": ShotcraftBulk62 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/autolayout-gap-dial/autolayoutgapdial/autolayoutgapdial": ShotcraftBulk63 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/canvas-materialize-moves/diagramcascadebuild/diagramcascadebuild": ShotcraftBulk64 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/canvas-materialize-moves/paneltocanvasmaterialize/paneltocanvasmaterialize": ShotcraftBulk65 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/chip-grid-single-select-blackout/chipgridsingleselectblackout/chipgridsingleselectblackout": ShotcraftBulk66 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/chip-lift-to-user-pill/chiplifttouserpill/chiplifttouserpill": ShotcraftBulk67 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/collab-cursor-moves/cursorcastensemble/cursorcastensemble": ShotcraftBulk68 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/collab-cursor-moves/cursordialogueduet/cursordialogueduet": ShotcraftBulk69 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/command-palette-summon/commandpalettesummon/commandpalettesummon": ShotcraftBulk70 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/glass-pill-dictation-typing/glasspilldictationtyping/glasspilldictationtyping": ShotcraftBulk71 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/hashtag-to-pill-materialize/hashtagtopillmaterialize/hashtagtopillmaterialize": ShotcraftBulk72 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/input-trigger-moves/cursorperformancepunchin/cursorperformancepunchin": ShotcraftBulk73 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/input-trigger-moves/keycapsmashcut/keycapsmashcut": ShotcraftBulk74 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/picker-carousel-feature-cycle/pickercarouselfeaturecycle/pickercarouselfeaturecycle": ShotcraftBulk75 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/segmented-thumb-hero/segmentedthumbhero/segmentedthumbhero": ShotcraftBulk76 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/theme-switch-moves/palettethemeripple/palettethemeripple": ShotcraftBulk77 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/theme-switch-moves/themesweeptoggle/themesweeptoggle": ShotcraftBulk78 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/type-and-filter/typeandfilter/typeandfilter": ShotcraftBulk79 as ComponentType<any>,
  "video-shotcraft/bulk/interaction/voice-waveform-live/voicewaveformlive/voicewaveformlive": ShotcraftBulk80 as ComponentType<any>,
  "video-shotcraft/bulk/opening/crane-rise-reveal/cranerisereveal/cranerisereveal": ShotcraftBulk81 as ComponentType<any>,
  "video-shotcraft/bulk/opening/dataviz-landscape-open/datavizlandscapeopen/datavizlandscapeopen": ShotcraftBulk82 as ComponentType<any>,
  "video-shotcraft/bulk/opening/fracture/fracture/fracture": ShotcraftBulk83 as ComponentType<any>,
  "video-shotcraft/bulk/opening/icon-field-colorize/iconfieldcolorize/iconfieldcolorize": ShotcraftBulk84 as ComponentType<any>,
  "video-shotcraft/bulk/opening/letterspace-materialize/letterspacematerialize/letterspacematerialize": ShotcraftBulk85 as ComponentType<any>,
  "video-shotcraft/bulk/opening/magician-card-flourish/magiciancardflourish/magiciancardflourish": ShotcraftBulk86 as ComponentType<any>,
  "video-shotcraft/bulk/opening/orbit-ring-title-open/orbitringtitleopen/orbitringtitleopen": ShotcraftBulk87 as ComponentType<any>,
  "video-shotcraft/bulk/opening/spotlight-hero-card/spotlightherocard/spotlightherocard": ShotcraftBulk88 as ComponentType<any>,
  "video-shotcraft/bulk/opening/stroke-segment-build/strokesegmentbuild/strokesegmentbuild": ShotcraftBulk89 as ComponentType<any>,
  "video-shotcraft/bulk/opening/text-as-mask/textasmask/textasmask": ShotcraftBulk90 as ComponentType<any>,
  "video-shotcraft/bulk/outro/edit-hook-moves/logostingbutton/logostingbutton": ShotcraftBulk91 as ComponentType<any>,
  "video-shotcraft/bulk/outro/grain-dissolve/graindissolve/graindissolve": ShotcraftBulk92 as ComponentType<any>,
  "video-shotcraft/bulk/outro/logo-shrink-wordmark-lockup/logoshrinkwordmarklockup/logoshrinkwordmarklockup": ShotcraftBulk93 as ComponentType<any>,
  "video-shotcraft/bulk/outro/neon-triple-marquee/neontriplemarquee/neontriplemarquee": ShotcraftBulk94 as ComponentType<any>,
  "video-shotcraft/bulk/outro/outro-group-photo-launch/outrogroupphotolaunch/outrogroupphotolaunch": ShotcraftBulk95 as ComponentType<any>,
  "video-shotcraft/bulk/outro/ui-strip-away-outro/uistripawayoutro/uistripawayoutro": ShotcraftBulk96 as ComponentType<any>,
  "video-shotcraft/bulk/outro/ui-to-brand-morph/iconflipbloomlogo/iconflipbloomlogo": ShotcraftBulk97 as ComponentType<any>,
  "video-shotcraft/bulk/outro/ui-to-brand-morph/inputmorphsintologo/inputmorphsintologo": ShotcraftBulk98 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/beat-cut-moves/beatcutaccelerando/beatcutaccelerando": ShotcraftBulk99 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/beat-cut-moves/paparazziflash/paparazziflash": ShotcraftBulk100 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/beat-step-list-theme-cycle/beatsteplistthemecycle/beatsteplistthemecycle": ShotcraftBulk101 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/montage-rhythm-moves/dominocascade/dominocascade": ShotcraftBulk102 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/montage-rhythm-moves/dropblackoutslam/dropblackoutslam": ShotcraftBulk103 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/montage-rhythm-moves/wrighttriplecut/wrighttriplecut": ShotcraftBulk104 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/panel-grid-moves/comicpanelsplit/comicpanelsplit": ShotcraftBulk105 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/panel-grid-moves/flipgridreflow/flipgridreflow": ShotcraftBulk106 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/panel-grid-moves/gridflashmosaic/gridflashmosaic": ShotcraftBulk107 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/quad-split-parallel-scenes/quadsplitparallelscenes/quadsplitparallelscenes": ShotcraftBulk108 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/rhythm-interrupt-moves/jumpcutpunchin/jumpcutpunchin": ShotcraftBulk109 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/rhythm-interrupt-moves/strobeblackframes/strobeblackframes": ShotcraftBulk110 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/sakuga-timing-shift/sakugatimingshift/sakugatimingshift": ShotcraftBulk111 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/smear-multiples/smearmultiples/smearmultiples": ShotcraftBulk112 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/spectrum-morph-ui/spectrummorphui/spectrummorphui": ShotcraftBulk113 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/speed-ramp-freeze/freezeannotatereal/freezeannotatereal": ShotcraftBulk114 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/speed-ramp-freeze/speedrampreal/speedrampreal": ShotcraftBulk115 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/trailer-grammar-moves/cardfootagecadence/cardfootagecadence": ShotcraftBulk116 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/trailer-grammar-moves/smashcut/smashcut": ShotcraftBulk117 as ComponentType<any>,
  "video-shotcraft/bulk/rhythm/trailer-grammar-moves/trailerbumper/trailerbumper": ShotcraftBulk118 as ComponentType<any>,
  "video-shotcraft/bulk/transition/bottom-push-stack-wipe/bottompushstackwipe/bottompushstackwipe": ShotcraftBulk119 as ComponentType<any>,
  "video-shotcraft/bulk/transition/bubble-swarm-takeover/bubbleswarmtakeover/bubbleswarmtakeover": ShotcraftBulk120 as ComponentType<any>,
  "video-shotcraft/bulk/transition/card-flip-reveal/cardflipreveal/cardflipreveal": ShotcraftBulk121 as ComponentType<any>,
  "video-shotcraft/bulk/transition/card-flock-tumble/cardflocktumble/cardflocktumble": ShotcraftBulk122 as ComponentType<any>,
  "video-shotcraft/bulk/transition/circle-match-iris/circlematchiris/circlematchiris": ShotcraftBulk123 as ComponentType<any>,
  "video-shotcraft/bulk/transition/color-block-step-wipe/colorblockstepwipe/colorblockstepwipe": ShotcraftBulk124 as ComponentType<any>,
  "video-shotcraft/bulk/transition/cube-navigation/cubenavigation/cubenavigation": ShotcraftBulk125 as ComponentType<any>,
  "video-shotcraft/bulk/transition/gradient-transition/gradienttransition/gradienttransition": ShotcraftBulk126 as ComponentType<any>,
  "video-shotcraft/bulk/transition/line-carry-transition/linecarrytransition/linecarrytransition": ShotcraftBulk127 as ComponentType<any>,
  "video-shotcraft/bulk/transition/mosaic-reframe/mosaicreframe/mosaicreframe": ShotcraftBulk128 as ComponentType<any>,
  "video-shotcraft/bulk/transition/page-turn-transitions/barndoorsplit/barndoorsplit": ShotcraftBulk129 as ComponentType<any>,
  "video-shotcraft/bulk/transition/page-turn-transitions/cuberotate/cuberotate": ShotcraftBulk130 as ComponentType<any>,
  "video-shotcraft/bulk/transition/paper-plane-messenger/paperplanemessenger/paperplanemessenger": ShotcraftBulk131 as ComponentType<any>,
  "video-shotcraft/bulk/transition/print-texture-transitions/inkbleedreveal/inkbleedreveal": ShotcraftBulk132 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/blackcardtransition/blackcardtransition": ShotcraftBulk133 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/darktunneltransition/darktunneltransition": ShotcraftBulk134 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/focushandofftransition/focushandofftransition": ShotcraftBulk135 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/maskwipereal/maskwipereal": ShotcraftBulk136 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/portalwipev2/portalwipev2": ShotcraftBulk137 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/whipbrakereal/whipbrakereal": ShotcraftBulk138 as ComponentType<any>,
  "video-shotcraft/bulk/transition/shot-transitions/whippanreal/whippanreal": ShotcraftBulk139 as ComponentType<any>,
  "video-shotcraft/bulk/transition/tear-streak-transitions/glitchdisplace/glitchdisplace": ShotcraftBulk140 as ComponentType<any>,
  "video-shotcraft/bulk/transition/transition-hidden-cut/invisiblecut/invisiblecut": ShotcraftBulk141 as ComponentType<any>,
  "video-shotcraft/bulk/transition/transition-hidden-cut/lightleakburn/lightleakburn": ShotcraftBulk142 as ComponentType<any>,
  "video-shotcraft/bulk/transition/transition-hidden-cut/versusslam/versusslam": ShotcraftBulk143 as ComponentType<any>,
  "video-shotcraft/bulk/transition/transition-travel/letterformzoom/letterformzoom": ShotcraftBulk144 as ComponentType<any>,
  "video-shotcraft/bulk/transition/transition-travel/sharedelementmorph/sharedelementmorph": ShotcraftBulk145 as ComponentType<any>,
  "video-shotcraft/bulk/transition/white-flash-logo-simplify-cut/whiteflashlogosimplifycut/whiteflashlogosimplifycut": ShotcraftBulk146 as ComponentType<any>,
  "video-shotcraft/bulk/transition/wipe-transitions/blindsslice/blindsslice": ShotcraftBulk147 as ComponentType<any>,
  "video-shotcraft/bulk/transition/wipe-transitions/clockwipe/clockwipe": ShotcraftBulk148 as ComponentType<any>,
  "video-shotcraft/bulk/typography/blur-slide/blurslide/blurslide": ShotcraftBulk149 as ComponentType<any>,
  "video-shotcraft/bulk/typography/brace-expand/braceexpand/braceexpand": ShotcraftBulk150 as ComponentType<any>,
  "video-shotcraft/bulk/typography/brand-ink-open/brandinkopen/brandinkopen": ShotcraftBulk151 as ComponentType<any>,
  "video-shotcraft/bulk/typography/cel-flash-stomp/celflashstomp/celflashstomp": ShotcraftBulk152 as ComponentType<any>,
  "video-shotcraft/bulk/typography/countdown-arc-scatter/countdownarcscatter/countdownarcscatter": ShotcraftBulk153 as ComponentType<any>,
  "video-shotcraft/bulk/typography/flying-words/flyingwords/flyingwords": ShotcraftBulk154 as ComponentType<any>,
  "video-shotcraft/bulk/typography/glitch-cycle/glitchcycle/glitchcycle": ShotcraftBulk155 as ComponentType<any>,
  "video-shotcraft/bulk/typography/gradient-word-sweep/gradientwordsweep/gradientwordsweep": ShotcraftBulk156 as ComponentType<any>,
  "video-shotcraft/bulk/typography/lead-word-zoom-assemble/leadwordzoomassemble/leadwordzoomassemble": ShotcraftBulk157 as ComponentType<any>,
  "video-shotcraft/bulk/typography/marker-underline-title/markerunderlinetitle/markerunderlinetitle": ShotcraftBulk158 as ComponentType<any>,
  "video-shotcraft/bulk/typography/outline-word-fill/outlinewordfill/outlinewordfill": ShotcraftBulk159 as ComponentType<any>,
  "video-shotcraft/bulk/typography/paper-title-card/papertitlecard/papertitlecard": ShotcraftBulk160 as ComponentType<any>,
  "video-shotcraft/bulk/typography/pill-chip-slot-cycle-handled/pillchipslotcyclehandled/pillchipslotcyclehandled": ShotcraftBulk161 as ComponentType<any>,
  "video-shotcraft/bulk/typography/pill-slot-cycle/pillslotcycle/pillslotcycle": ShotcraftBulk162 as ComponentType<any>,
  "video-shotcraft/bulk/typography/scramble/scramble/scramble": ShotcraftBulk163 as ComponentType<any>,
  "video-shotcraft/bulk/typography/split-flap-title/splitflapflip/splitflapflip": ShotcraftBulk164 as ComponentType<any>,
  "video-shotcraft/bulk/typography/text-column-converge/textcolumnconverge/textcolumnconverge": ShotcraftBulk165 as ComponentType<any>,
  "video-shotcraft/bulk/typography/title-demote-to-label/titledemotetolabel/titledemotetolabel": ShotcraftBulk166 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-assembly-moves/letterformdriftassembly/letterformdriftassembly": ShotcraftBulk167 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-assembly-moves/splittextstagger/splittextstagger": ShotcraftBulk168 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-assembly-moves/textonpath/textonpath": ShotcraftBulk169 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-assembly-moves/trackingexpandreveal/trackingexpandreveal": ShotcraftBulk170 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-entrance-moves/letterdropphysics/letterdropphysics": ShotcraftBulk171 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-entrance-moves/scrambledecode/scrambledecode": ShotcraftBulk172 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-rhythm-sync/fontweightpump/fontweightpump": ShotcraftBulk173 as ComponentType<any>,
  "video-shotcraft/bulk/typography/type-rhythm-sync/karaokefillsync/karaokefillsync": ShotcraftBulk174 as ComponentType<any>,
  "video-shotcraft/bulk/typography/typewriter-moves/terminaltypewriter/terminaltypewriter": ShotcraftBulk175 as ComponentType<any>,
  "video-shotcraft/bulk/typography/typewriter-moves/typewritererrorretype/typewritererrorretype": ShotcraftBulk176 as ComponentType<any>,
  "video-shotcraft/bulk/typography/typing-code-block/typingcodeblock/typingcodeblock": ShotcraftBulk177 as ComponentType<any>,
  "video-shotcraft/bulk/typography/vertical-word-roll-blur-cycle/verticalwordrollblurcycle/verticalwordrollblurcycle": ShotcraftBulk178 as ComponentType<any>,
  "video-shotcraft/bulk/typography/word-relay-filmstrip/wordrelayfilmstrip/wordrelayfilmstrip": ShotcraftBulk179 as ComponentType<any>,
  "video-shotcraft/bulk/typography/word-relay-geometry/wordrelaygeometry/wordrelaygeometry": ShotcraftBulk180 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/avatar-bracket-carousel/avatarbracketcarousel/avatarbracketcarousel": ShotcraftBulk181 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/bezier-source-converge-merge/beziersourceconvergemerge/beziersourceconvergemerge": ShotcraftBulk182 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/card-stack/cardstack/cardstack": ShotcraftBulk183 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/carousel-3d/carousel3d/carousel3d": ShotcraftBulk184 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/clipcard-looping/clipcardlooping/clipcardlooping": ShotcraftBulk185 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/cloner-depth-echo/clonerdepthecho/clonerdepthecho": ShotcraftBulk186 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/deck-deal-flyin/deckdealflyin/deckdealflyin": ShotcraftBulk187 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/doc-park-left-pill-deal/docparkleftpilldeal/docparkleftpilldeal": ShotcraftBulk188 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/document-typewriter-reveal/documenttypewriterreveal/documenttypewriterreveal": ShotcraftBulk189 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/draw-svg-trace/drawsvgtrace/drawsvgtrace": ShotcraftBulk190 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/element-body-moves/axialstretch/axialstretch": ShotcraftBulk191 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/element-body-moves/contactshadowlift/contactshadowlift": ShotcraftBulk192 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/floating-glossy-label-pills/floatingglossylabelpills/floatingglossylabelpills": ShotcraftBulk193 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/integration-hub-map/integrationhubmap/integrationhubmap": ShotcraftBulk194 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/list-reveal/listreveal/listreveal": ShotcraftBulk195 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/list-stack-press/liststackpress/liststackpress": ShotcraftBulk196 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/morph-from-primitive/morphfromprimitive/morphfromprimitive": ShotcraftBulk197 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/neon-frame-forerun/neonframeforerun/neonframeforerun": ShotcraftBulk198 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/neon-frame-orbit-drop/neonframeforerunorbit/neonframeforerunorbit": ShotcraftBulk199 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/page-waterfall-wall/pagewaterfallwall/pagewaterfallwall": ShotcraftBulk200 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/paper-craft-moves/maskingtapeslap/maskingtapeslap": ShotcraftBulk201 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/paper-craft-moves/popupbookrise/popupbookrise": ShotcraftBulk202 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/platform-hinge-rise/platformhingerise/platformhingerise": ShotcraftBulk203 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/product-card-progressive-assemble/productcardprogressiveassemble/productcardprogressiveassemble": ShotcraftBulk204 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/radial-wave/radialwave/radialwave": ShotcraftBulk205 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/research-card-stack-scroll/researchcardstackscroll/researchcardstackscroll": ShotcraftBulk206 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/row-embed/rowembed/rowembed": ShotcraftBulk207 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/runway-ground-skim/runwaygroundskim/runwaygroundskim": ShotcraftBulk208 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/skeleton-reveal/skeletonreveal/skeletonreveal": ShotcraftBulk209 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/svg-shape-morph/svgshapemorph/svgshapemorph": ShotcraftBulk210 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/value-stagger-gradient/valuestaggergradient/valuestaggergradient": ShotcraftBulk211 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/wall-reveal-moves/bentolightup/bentolightup": ShotcraftBulk212 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/wall-reveal-moves/gridwaveflip/gridwaveflip": ShotcraftBulk213 as ComponentType<any>,
  "video-shotcraft/bulk/ui-entrance/wall-reveal-moves/wireframedrawon/wireframedrawon": ShotcraftBulk214 as ComponentType<any>,
  "video-shotcraft/bulk/template/morning": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk215 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/table": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk216 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/macro": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk217 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/chart": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk218 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/wbr": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk219 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/title-card": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk220 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/caption": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk221 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/flash-cut": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk222 {...props}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-modern-light": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk223 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-midnight": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk224 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-solar-pop": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk225 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-coral-burst": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk226 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-color-play": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk227 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-deep-ocean": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk228 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-obsidian-violet": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk229 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
  "video-shotcraft/bulk/template/film-vintage-kraft": (({theme = 'ink-press', colors, assetBase = 'sources/video-shotcraft/bulk/template', ...props}) => <VisualThemeProvider theme={theme} colors={colors} assetBase={assetBase}><ShotcraftBulk230 {...props} theme={theme} colors={colors} assetBase={assetBase}/></VisualThemeProvider>) as ComponentType<any>,
};
