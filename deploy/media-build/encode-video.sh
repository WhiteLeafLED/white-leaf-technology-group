#!/bin/bash
# Re-encode a narrated site video. usage: encode-video.sh SRC.mp4 NAME OUTDIR
# Produces OUTDIR/NAME.mp4 (1280x720 player, audio kept) and OUTDIR/NAME-tile.mp4 (854x480 muted loop).
S=$1; n=$2; O=${3:-.}
ch=$(ffprobe -v error -select_streams a:0 -show_entries stream=channels -of csv=p=0 "$S")
ab=64k; [ "$ch" = "2" ] && ab=96k
ffmpeg -y -v error -i "$S" -map 0:v:0 -map 0:a:0 -c:v libx264 -preset slower -crf 25 -profile:v high -pix_fmt yuv420p -c:a aac -b:a $ab -movflags +faststart "$O/$n.mp4"
ffmpeg -y -v error -i "$S" -an -vf scale=854:480:flags=lanczos -c:v libx264 -preset slower -crf 30 -profile:v main -pix_fmt yuv420p -movflags +faststart "$O/$n-tile.mp4"
# hero background (no audio): ffmpeg -i flyby.mp4 -an -c:v libx264 -preset slower -crf 29 -profile:v high -pix_fmt yuv420p -movflags +faststart flyby.mp4
