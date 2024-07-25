# User documentation for the tensor compute cluster at MEB

## What is tensor?

Tensor is a small High Performance Computing cluster available to MEB
researchers. It replaces previous compute servers `vector` and `scalar[1-4]`.

The tensor cluster consists of a login node (`tensor`) and seven compute nodes
(`tensor[1-7]`) with capable CPUs and fast local storage. A selection of
common software is preinstalled, and more can be added on request.

As on larger HPC systems, work is typically done by submitting jobs to a queue
system, where they will be processed in order.

![tensor cluster layout](figures/tensor_environment_240220.png)

## Connecting

The login node `tensor.meb.ki.se` or just `tensor` is only accessible from
within MEB's network (or through VDI).

### Windows

Use KiTTY, (available in MEB Software Center), or your own preferred SSH program
to connect to the host `tensor`.

> [!TIP] 
> Create a saved KiTTY session with the hostname `tensor`, and tick the
> box in `Connection -> Data` to "Use system username". With this setting you
> should be able to connect without typing anything (your Windows login will be
> re-used).

### Mac/Linux

Use `ssh` in the terminal, or some other interface that you prefer, to connect
to `tensor` with your MEB username and password.

> [!TIP]
> Use SSH keys for passwordless login (see for example [instructions at
> Uppmax](https://www.uppmax.uu.se/support/faq/login-problems-faq/how-do-i-use-ssh-keys-to-login-to-uppmax/))

## Software modules

Preinstalled software packages on tensor are available through the **modules**
(lmod) system. A quick introduction is available at the [lmod
website](https://lmod.readthedocs.io/en/latest/010_user.html).

To run preinstalled software you first need to load it with the `module load`
command (or the shorter but equivalent `ml`).

When more than one version of a package is available you can specify which one
to load or accept the default version which is usually the latest.

For example:

```bash
ml load R/4.3.2
ml load bcftools/1.19
ml load rclone
```

To always load a certain set of modules, [add them to your `.bashrc` startup
script](https://lmod.readthedocs.io/en/latest/010_user.html#controlling-modules-during-login).

To see the current list of available modules (including dependencies), type `ml
avail`. The following packages (+ dependencies) are installed:
<!-- cat /nfs/sw/eb/meb-eb/tensor_software.yaml | sed -r 's/(-((GCC)|(gfbf)).*)?.eb[: ]*$//' | egrep -v '^[ ]{4,}'  | sed -r 's/([^[:blank:]])-/\1 /' | sed 's/^  #/###/' -->

### statistics
  - R 4.3.2
  - R 4.4.0
  - rstudio 2023.09.1
  - Stata 18
  
### genetics
  - gtool 0.7.5
  - qctool 2.2.0
  - snptest 2.5.6
  - gcta 1.94.1
  - plink 1.07
  - plink 1.90b7.1
  - plink2 2.00a5.10
  - metal 2011-03-25
  - metal 2020-05-05
  - EIGENSOFT 8.0.0
  - bedtools 2.31.1
  - htslib 1.19.1
  - bcftools 1.19
  - samtools 1.19.2
  - ldsc 2.0.1
  - gtc2vcf 2023-12-06
  - regenie 3.4.1
  
### general tools
  - ncdu 1.19
  - tmux 3.3a
  - rclone 1.65.2
  - parallel 20240122
  - nextflow 23.10.1
  - lftp 4.9.2
  - mebauth 0.1

## Running jobs - Slurm

The login node `tensor` has very limited capacity (by design), and is only to be
used for job submission, monitoring, and other light tasks. Any serious
computation, *including interactive analyses*, should be done on the compute
nodes `tensor[1-7]` by submitting requests for resources to the Slurm job
queue. This is a change from the recommendations for the older vector/scalar servers.

The tensor cluster currently runs [Slurm version
23.11.1](https://slurm.schedmd.com/archive/slurm-23.11.1/).

### Batch jobs - `sbatch`

Run a batch job by preparing a shell script file with the commands you want to
run on the cluster, and then submit it with the command

```bash
sbatch my_job_script.sh
```

You can specify the CPU core, time, and memory requirements as options to sbatch
on the command line (`-c ...`, `-t ...`, `--mem=...` or `--mem-per-cpu=...`), OR
as special comments at the start your script file (before any actual commands):

```bash
#!/bin/bash

#SBATCH -c ...
#SBATCH -t ...
#SBATCH --mem=...

...

[the code you really want to run]
```

See [the Slurm
manual](https://slurm.schedmd.com/archive/slurm-23.11.1/sbatch.html) for how to
format the requirements.

If any job parameters are left unspecified, the defaults are 2 CPU threads, 7 GB
RAM per CPU, and 4 hours of run time. The requirements cannot be increased once
the job has started.

Note that in most cases it is not enough to ask Slurm for more CPUs to make your
program run faster - you must usually adapt your code to make use of the given
resources.

In some cases it can be as simple as adding a `--threads N` flag to some command
that already knows how to run in parallel. In other cases it can make more sense
to split the data somehow, and then submit many smaller single-threaded slurm
jobs that each work on a small part of it.

### Interactive jobs - `salloc`

Start an interactive session on a compute node with the `salloc` command.
Specify the CPU core, time, and memory requirements as options on the command
line (`-c ...`, `-t ...`, `--mem=...` or `--mem-per-cpu=...`).

If any job parameters are left unspecified, the defaults are 2 CPU threads, 7 GB
RAM per CPU, and 4 hours of run time. The requirements cannot be increased once
the job has started.

For example, an interactive session that runs for up to one day, with access to
8 CPU cores and 56 GB RAM (given by default as 7 GB per allocated core), can be
requested as:

```bash
salloc -c 8 -t 1-0
```

#### Interactive jobs with graphical display (X)

First start an X server on your local computer. On Windows this means starting
the program VcXsrv (available in MEB software center). The start menu entry for
VcXsrv is "XLaunch". On a Mac, try XQuartz. On Linux, an X server is usually
already running, or you already know how to start one if not.

In KiTTY, tick the box "Enable X11 forwarding" under `Connection -> SSH -> X11`
before connecting. On Mac/Linux, add the `-Y ` flag to your `ssh` command, or
add "ForwardX11Trusted yes" to the settings for tensor in your local
`~/.ssh/config` file.

Next, request an interactive job on tensor as usual, but add the flag `--x11`.

```bash
salloc [other job parameters] --x11
```

Graphical output from the allocated compute node (like a plot window in R)
should now appear on your computer.

### Monitoring Slurm jobs

To see a list of the jobs currently running (and waiting to run) on the cluster,
use [the `squeue`
command](https://slurm.schedmd.com/archive/slurm-23.11.1/squeue.html). 

The amount of job information shown can be controlled with flags. For example,
`squeue -l` gives the headings `JOBID, PARTITION, NAME, USER, STATE, TIME,
TIME_LIMIT, NODES, NODELIST(REASON)`. If the queue is long, and you only want
to see your own jobs, try `squeue --me`.

If you want to cancel a job that is running or waiting in the queue, use [the 
`scancel` command](https://slurm.schedmd.com/archive/slurm-23.11.1/scancel.html).

```bash
# cancel your job with jobid 12345
scancel 12345

# cancel ALL your running and queued jobs (use with caution)
scancel --me
```

To monitor the resource usage (memory/CPU) of a running job, it is possible to
run a monitoring command within an existing allocation (interactive or
non-interactive). Run the following on the login node in a separate window or
tmux pane to start htop next to your existing job:

```bash
srun --jobid=[job ID of interest] --overlap --pty htop
```

The job ID of the job to monitor is displayed when it is first submitted to the
queue, and in `squeue` output.

After a job has finished, a brief summary of memory and CPU usage can be
displayed by running

```bash
seff [job ID of interest]
```
This information can be useful when deciding how much memory/CPU to request for
the next job.

## Storage

### /nfs files

Files in `/nfs/[projectname]/`, `/nfs/projects/[projectname]/`, and
`/nfs/home/[username]/` are stored on fast network drives available from all
tensor nodes. Use these paths for long-term storage of data, code, and results.

### /scratch

For temporary files created during a single Slurm job, which are no longer
needed after the job is finished, use the very fast node-local storage in
`/scratch/tmp/`. Each node's `/scratch/tmp` has a maximum capacity of 3.5 TB,
which can be used by jobs on a first-come-first-served basis (to ensure
access to the full capacity, you must reserve a full node).

Note that this folder is uniquely created for each Slurm job
(so jobs cannot see /scratch files created in other jobs), and it is
automatically cleared after the job ends (along with `/tmp/`).

### P: and Z: files

The Windows `P:` and `Z:` volumes are available on tensor as `/cifs/P/` and
`/cifs/Z/$USER/`. To access them you must have a valid Kerberos ticket (see
"[Kerberos authentication](#kerberos-authentication)" for how to get one).

> [!NOTE]
> For jobs requiring stable and high-performance file access, we recommend the
> `/nfs` and `/scratch` file systems over `/cifs`.

### File transfer to and from tensor

For transferring files between your computer and tensor, you can use scp
(WinSCP) or sftp (FileZilla, lftp).

If you are connecting with KiTTY, there is a menu option to open WinSCP over the
same connection as your terminal:

![Starting WinSCP from KiTTY](figures/tensor_kitty_winscp.png)

[rclone](https://rclone.org/) is available as a software module (`ml load
rclone`) for syncing files in cloud storage to tensor.

## Accessing the kosmos SQL server

The `kosmos` SQL server is available from tensor with a valid Kerberos ticket
(see "[Kerberos authentication](#kerberos-authentication)" for how to get one).

## Kerberos authentication

To set up credentials for a job using the kosmos SQL server and/or the Windows
`P:` and `Z:` volumes, you first need to create a "keytab" file (only once per
MEB password change cycle), and then request the actual Kerberos tickets using
the keytab file.

> [!IMPORTANT]
> Do not share your keytab file with anyone else - it is as sensitive as your
> password!

A software module is available which automates the process. To use it, first
run 

```bash 
module load mebauth
```

on the login node or in an interactive slurm session. Enter your MEB password
when asked for it. After this, you can authenticate in any job (*including batch
jobs*) by just loading the module. The tickets will stay valid for the duration
of the job.

Non-interactive authentication by loading the `mebauth` module will work until
your MEB password expires. At that time you must once again load the module in
an interactive session to reauthenticate.

The `mebauth` module uses `ktutil` to save a keytab file in `$HOME/.kt`,
and then calls `k5start` to request Kerberos tickets and keep them valid.

## Mailing list

To communicate with (all) other users of the tensor cluster, send an email
to [meb-tensor@emaillist.ki.se](mailto:meb-tensor@emaillist.ki.se).

## Getting an account

If you want to work on tensor and don't have an account,
[please apply through this form](https://www.meb.ki.se/sites/meb-it-internal/computing-resources-at-meb/#request_compute_server_account)
(site only available from inside MEB or VDI).

---

This manual maintained by Robert Karlsson, Rikard Öberg, Henric Winell

Last update 2024-06-10
