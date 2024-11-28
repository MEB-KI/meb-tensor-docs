# Installing/updating software on `tensor` with Easybuild

Brief instructions on how to add or update software in the MEB Easybuild
collection.

### Work on a compute node

```bash
salloc -t1-0 -c8
```

(adjust number of cores if needed for build performance)

### Enable Easybuild with modules

```bash
ml add EasyBuild
```

### Start from existing .eb files

If updating, check previous version in MEB repository
<https://github.com/MEB-KI/meb-eb>

If new install, check what is available in
<https://github.com/easybuilders/easybuild-easyconfigs>

Look for files using the same EasyBuild toolchain as the rest of installed
software. Currently this is `gfbf-2023b`, or compatible sub-toolchains
`GCC-13.2.0` and `GCCCore-13.2.0`.

### Adapt eb files

Work in a local clone of <https://github.com/MEB-KI/meb-eb>. New .eb files go in
`meb-eb/easyconfigs/{initial}/{software}/software-version.major.minor-toolchain-version.eb`

Check whether some/none/all listed dependencies are already installed (see "Test
build", dry run). If another version of a dependency is already installed,
consider if that could be used, and if so, update version in .eb file.

### Test build

```bash
# keep/remove -D flag for dry-run on/off
# use --buildpath on /scratch for performance and to avoid filesystem time issues
# use --umask to make sure the results are modifiable by the lx_sw group and not by others
# use --module-depends-on for slightly nicer lmod files
# use --detect-loaded-modules=unload for a clean(er) build environment
# use --trace for nicer output
eb --buildpath=$TMPDIR/ebtmp --umask=002 --robot-paths=$HOME/meb-eb/easyconfigs/: --module-depends-on --detect-loaded-modules=unload -rD --trace software-version.major.minor.eb
```

Default install prefix is `$HOME/.local/easybuild/`. To enable this path in
modules (for more careful testing), `ml use $HOME/.local/easybuild/modules/all`.
Remember to `ml unuse ...` the path before system-wide installation, or
Easybuild will find the module in your home folder and think it is already
installed.

It is probably a good idea to clean up this prefix once in a while so the
personal library does not drift too far from the central one.

If dependencies must also be installed, they will be pulled from the central
EasyBuild repo <https://github.com/easybuilders/easybuild-easyconfigs>. If
dependencies need customization, put the customized .eb file in the meb-eb
repository and it will be used before the central repo version.

### Central install and finish up

- push added and verified working .eb files to MEB repository on github
- pull from github to repository on tensor (in /nfs/sw/eb/meb-eb)
- build and install newly added software:
```bash
eb --prefix=/nfs/sw/eb --buildpath=$TMPDIR/ebtmp --umask=002 --robot-paths=/nfs/sw/eb/meb-eb/easyconfigs/: --module-depends-on --detect-loaded-modules=unload -r --trace software-version.major.minor.eb
```
- if the newly installed package version should not be the default, put a
  `default` symlink to the desired default version in `/nfs/sw/eb/modules/all/{software}/`
- add name of eb file to meb-eb/tensor_software.yaml
- update tensor docs with software name (instructions in comment in README.md)
