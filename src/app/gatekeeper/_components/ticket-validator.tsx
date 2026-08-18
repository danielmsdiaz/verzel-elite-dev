"use client";

import type { IScannerControls } from "@zxing/browser";
import {
  Camera,
  CheckCircle2,
  Keyboard,
  LoaderCircle,
  ScanLine,
  StopCircle,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { formatEventDate, formatEventTime } from "@/lib/formatters";
import {
  validateTicketAction,
  type GatekeeperValidationState,
} from "@/server/gatekeeper/actions";

const initialState: GatekeeperValidationState = {};

export function TicketValidator() {
  const [state, formAction, isPending] = useActionState(
    validateTicketAction,
    initialState,
  );
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hideResult, setHideResult] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    return () => controlsRef.current?.stop();
  }, []);

  async function startScanner() {
    if (!videoRef.current || isScanning) return;

    setCameraError(null);
    setHideResult(true);
    setIsScanning(true);
    submittedRef.current = false;

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 250,
      });
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, _error, scannerControls) => {
          if (!result || submittedRef.current) return;

          submittedRef.current = true;
          scannerControls.stop();
          controlsRef.current = null;
          setIsScanning(false);

          if (inputRef.current) inputRef.current.value = result.getText();
          setHideResult(false);
          formRef.current?.requestSubmit();
        },
      );

      controlsRef.current = controls;
    } catch (error) {
      console.error("QR camera failed:", error);
      controlsRef.current?.stop();
      controlsRef.current = null;
      setIsScanning(false);
      setCameraError(
        "Não foi possível acessar a câmera. Confira a permissão ou use o código manual.",
      );
    }
  }

  function stopScanner() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  }

  function prepareNextValidation() {
    setHideResult(true);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }

  const resultStyle = getResultStyle(state.outcome);
  const ResultIcon = resultStyle.icon;

  return (
    <div className="rounded-[1.75rem] border-2 border-zinc-950 bg-white p-5 shadow-[5px_5px_0_#a1a1aa] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.18em] text-zinc-500 uppercase">
            Leitor
          </p>
          <h2 className="mt-1 font-serif text-3xl font-bold">Validar ingresso</h2>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-zinc-950 text-white">
          <ScanLine aria-hidden="true" className="size-5" />
        </span>
      </div>

      <div
        className={`relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl border-2 border-zinc-950 bg-zinc-950 ${
          isScanning ? "block" : "hidden"
        }`}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-white/90"
        />
        <button
          type="button"
          onClick={stopScanner}
          className="absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-zinc-950"
        >
          <StopCircle aria-hidden="true" className="size-4" />
          Parar câmera
        </button>
      </div>

      {!isScanning ? (
        <button
          type="button"
          onClick={startScanner}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-bold text-white transition hover:-translate-y-0.5"
        >
          <Camera aria-hidden="true" className="size-4" />
          Ler QR pela câmera
        </button>
      ) : null}

      {cameraError ? (
        <p className="mt-3 text-xs leading-5 text-red-700">{cameraError}</p>
      ) : null}

      <div className="my-6 flex items-center gap-3 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
        <span className="h-px flex-1 bg-zinc-200" />
        ou digite
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form
        ref={formRef}
        action={formAction}
        onSubmit={() => {
          stopScanner();
          setHideResult(false);
        }}
      >
        <label htmlFor="ticket-code" className="text-xs font-bold">
          Código ou link do ingresso
        </label>
        <div className="mt-2 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Keyboard
              aria-hidden="true"
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              ref={inputRef}
              id="ticket-code"
              name="ticketCode"
              required
              autoComplete="off"
              placeholder="TKT-... ou link compartilhado"
              className="min-h-11 w-full rounded-xl border-2 border-zinc-300 py-2 pr-3 pl-10 text-sm outline-none transition focus:border-zinc-950"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border-2 border-zinc-950 bg-white px-4 text-sm font-bold disabled:opacity-50"
          >
            {isPending ? (
              <LoaderCircle aria-label="Validando" className="size-4 animate-spin" />
            ) : (
              "Validar"
            )}
          </button>
        </div>
      </form>

      {state.outcome && !hideResult ? (
        <div
          role="status"
          className={`mt-6 rounded-2xl border-2 p-5 ${resultStyle.className}`}
        >
          <div className="flex items-start gap-3">
            <ResultIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0" />
            <div className="min-w-0">
              <p className="font-serif text-2xl font-bold">{state.message}</p>
              {state.ticket ? (
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-bold">{state.ticket.event.title}</p>
                  <p>
                    {formatEventDate(new Date(state.ticket.event.startsAt))} ·{" "}
                    {formatEventTime(new Date(state.ticket.event.startsAt))}
                  </p>
                  <p>
                    {state.ticket.event.venue} · {state.ticket.event.room} ·
                    Assento {state.ticket.seat.label}
                  </p>
                  <p className="pt-1 font-mono text-xs">{state.ticket.code}</p>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={prepareNextValidation}
            className="mt-5 min-h-9 rounded-full border-2 border-current px-4 text-xs font-bold"
          >
            Validar outro
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getResultStyle(outcome: GatekeeperValidationState["outcome"]) {
  if (outcome === "accepted") {
    return {
      icon: CheckCircle2,
      className: "border-emerald-700 bg-emerald-50 text-emerald-900",
    };
  }
  if (outcome === "used") {
    return {
      icon: TriangleAlert,
      className: "border-amber-700 bg-amber-50 text-amber-950",
    };
  }
  return {
    icon: XCircle,
    className: "border-red-700 bg-red-50 text-red-900",
  };
}
