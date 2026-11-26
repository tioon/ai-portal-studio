#!/usr/bin/env python3
"""Parser regression checks on small roff samples:  python3 test_manparse.py"""
import os, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import manparse

MAN = r'''.TH DEMO 1 "2024-01-01" "demo 1.0" "User Commands"
.SH NAME
demo, demo2 \- do a thing
.SH SYNOPSIS
.B demo
[\fIOPTION\fR]... \fIFILE\fR
.SH OPTIONS
.SS Output control
.TP
\fB\-a\fR, \fB\-\-all\fR
show <everything> & more
.TP
\fB\-o\fR \fIFILE\fR, \fB\-\-output\fR=\fIFILE\fR
write to FILE
.SH COMMANDS
.TP
.B start \fIUNIT\fR
Start it.
'''
DOCBOOK = r'''.TH DEMO 8
.SH NAME
demo \- docbook style
.SH OPTIONS
.PP
\fB\-\-now\fR
.RS 4
Do it now\&.
.RE
.PP
\fB\-q\fR, \fB\-\-quiet\fR
.RS 4
Be quiet\&.
.RE
'''
MDOC = r'''.Dd January 1, 2024
.Dt DEMO 1
.Os
.Sh NAME
.Nm demo
.Nd mdoc style
.Sh DESCRIPTION
.Bl -tag -width Ds
.It Fl 4
Force IPv4.
.It Fl p Ar port
Port to use.
.El
'''
OLD = r'''.TH DEMO 1
.SH NAME
demo \- old style
.SH OPTIONS
.B \-\-no\-reload
.br
Do not reload.
'''


def parse(src):
    with tempfile.NamedTemporaryFile("w", suffix=".1", delete=False) as f:
        f.write(src)
    try:
        return manparse.render(f.name)
    finally:
        os.unlink(f.name)


def flags(doc):
    return [fl for o in doc["opts"] for fl in o[1]]


d = parse(MAN)
assert d["names"] == ["demo", "demo2"] and d["desc"] == "do a thing", d
assert flags(d) == ["-a", "--all", "-o", "--output"], flags(d)
assert d["opts"][0][2] == "Output control"
body = dict((t, h) for t, h in d["secs"])
assert "&lt;everything&gt; &amp; more" in body["OPTIONS"], "text must stay escaped"
assert "<script" not in body["OPTIONS"] and 'data-o=""' in body["OPTIONS"]
assert 'data-c=""' in body["COMMANDS"]
assert flags(parse(DOCBOOK)) == ["--now", "-q", "--quiet"]
assert flags(parse(MDOC)) == ["-4", "-p"]
assert flags(parse(OLD)) == ["--no-reload"]
assert manparse.so_target(b".so man1/tar.1\n") == ("tar", "1")
assert manparse.flags_of("-A, --catenate=FILE, -") == ["-A", "--catenate"]
print("ok")
