from fabric.api import run, env, cd

# We can then specify host(s) and run the same commands across those systems
env.user = 'humitos'
env.hosts = ['mkaufmann.com.ar']
env.shell = '/bin/bash -l -c'
env.colorize_errors = True
env.project = '/home/humitos/apps/osm-pois'


def deploy():
    with cd(env.project):
        run('git pull')
