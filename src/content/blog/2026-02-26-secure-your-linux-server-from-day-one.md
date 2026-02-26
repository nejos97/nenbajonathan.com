---
author: Jonathan Nenba
pubDatetime: 2026-02-26T15:00:00Z
title: 'What happened when I moved my apps to my own server'
slug: secure-your-linux-server-from-day-one
featured: false
draft: true
tags:
  - linux
  - security
  - ssh
  - hetzner
  - fail2ban
  - devops
  - monitoring
  - betterstack
description: After migrating my apps to Hetzner, bots were knocking within the hour. Here's what I did to lock down my server using SSH keys, Fail2ban, UFW, and real-time monitoring with Betterstack.
---

A few weeks ago I decided to migrate some of my applications to a new server on Hetzner. The price was great, the specs were solid, and I was excited to get everything running.

What I didn't expect was what happened next.

Within **less than an hour** of the server being live, I started seeing hundreds of failed login attempts in my logs. Bots scanning for open ports, trying default credentials, probing for known vulnerabilities. It felt weirdly personal, like someone was already rattling the doorknob before I even finished moving in.

So I spent the next few hours locking everything down properly. Here's what I did, what I learned, and the things I almost forgot.

## The first thing I did wrong: staying on root

When you spin up a fresh server, you usually get a root account. It's tempting to just... use it. Everything works, no `sudo` friction, you get stuff done fast.

That's a mistake. Root is the first account bots try. It's predictable, it's powerful, and if someone gets in, it's game over.

So the very first thing I do now on any new server is create a regular user:

```bash
adduser wick
usermod -aG sudo wick
```

Then I log out and log back in as that user. Root stays locked.

## The thing that changed everything: SSH keys only

I used to think SSH password login was "fine as long as the password is strong." I was wrong.

The bots don't care how strong your password is. They're patient. They'll try thousands of combinations per hour, from thousands of different IPs. All they need is time.

So I switched to **SSH key authentication only** and completely disabled password login. Here's how:

First, on your local machine, generate a key if you don't have one yet:

```bash
ssh-keygen -t ed25519 -C "wick@thekiller.com"
```

Then push it to the server:

```bash
ssh-copy-id wick@server.thekiller.com
```

Then on the server, edit `/etc/ssh/sshd_config`:

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

Restart SSH:

```bash
systemctl restart sshd
```

> **Important:** Before you close your current terminal session, open a *new* one and test that key login works. If you made a typo somewhere and lock yourself out, you'll have to go through your provider's rescue console. Trust me, that's a painful experience.

One more thing I do: **change the default SSH port**. Port 22 is the first thing every scanner looks for. Moving to something like 2222 or 4822 doesn't make you more secure against a targeted attack, but it kills 90% of the background noise instantly.

```
Port 2222
```

Don't forget to open that port in your firewall before restarting SSH, or you'll lock yourself out.

## UFW: keeping the firewall simple

I've tried iptables directly. It's powerful but the syntax is painful to work with. UFW wraps everything in a cleaner interface and I've never felt limited by it for server use.

```bash
apt install ufw -y

ufw allow 2222/tcp   # SSH (your new port)
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw enable
```

One thing I forgot the first time: **UFW is disabled by default** even after install. You have to explicitly run `ufw enable`. Sounds obvious but I've definitely set up a server thinking it was protected when it wasn't.

But here's something that caught me off guard on Hetzner: **your cloud provider has its own firewall layer**, separate from UFW. Even if UFW is perfectly configured, traffic might still get blocked, or even worse, allowed at the infrastructure level before it ever reaches your server.

On Hetzner, this is managed through their **Firewall** feature in the Cloud Console. I spent a good 20 minutes wondering why my custom SSH port wasn't reachable after changing it, only to realize the Hetzner firewall was still only allowing port 22.

So whenever you change a port or open a new one, check **both places**:

1. Your UFW rules (`ufw status verbose`)
2. Your cloud provider's firewall panel (Hetzner Cloud Console, DigitalOcean Firewall, AWS Security Groups, etc.)

Think of it as two doors. UFW is the door inside your server. Your provider's firewall is the door to the building. Both need to be open for traffic to get through, and both need to be locked down for real protection.

## Fail2ban: the thing I should have set up years ago

Even with SSH keys, your logs will still fill up with failed attempts from bots probing other services. Fail2ban watches your logs and auto-bans IPs that cross a threshold.

```bash
apt install fail2ban -y
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Always work from `jail.local` because the original file gets overwritten on updates.

My SSH jail config looks like this:

```ini
[sshd]
enabled = true
port    = 2222
filter  = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime  = 86400
findtime = 600
```

I set `bantime` to 86400 (24 hours) instead of the default 10 minutes. If a bot is already hammering your server, a 10-minute timeout just means it'll come back in 10 minutes. Make it hurt a little more.

```bash
systemctl enable --now fail2ban

# Check what's currently banned
fail2ban-client status sshd
```

## The thing I almost skipped: monitoring

I got so focused on locking the front door that I almost forgot to install a camera.

Securing a server without monitoring it is like locking your house and never checking if someone broke a window. You won't know something is wrong until it's already bad.

I set up **Betterstack** for this. It handles both uptime monitoring and log shipping in one place, and the setup is genuinely fast. They give you a one-line install command:

```bash
wget -q https://logs.betterstack.com/setup/linux/YOUR_TOKEN -O setup.sh && sudo bash setup.sh
```

Once it's running, I get:
- Alerts if the server goes down
- CPU and memory usage over time, which helps catch slow memory leaks before they crash something
- Real-time log search

## A few things I learned the hard way

**Keep your software updated.** Most serious breaches don't happen through fancy zero-days. They happen through known vulnerabilities in outdated software. Enable automatic security updates:

```bash
apt install unattended-upgrades -y
dpkg-reconfigure --priority=low unattended-upgrades
```

**Disable services you don't use.** Every running service is a potential attack surface. On a fresh Ubuntu install, there are often things running that you don't need:

```bash
systemctl list-units --type=service --state=running
systemctl disable --now servicename
```

**Check your open ports regularly.** You might think only port 80, 443, and 2222 are open. But a service you installed could have opened something else without you noticing:

```bash
ss -tulpn
```

**Back up your SSH config before touching it.** Seriously. One wrong character and you lose access. Copy it first:

```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

**Use `AllowUsers` in your SSH config.** Even with key auth, you can add an extra layer by explicitly whitelisting which usernames can connect via SSH:

```
AllowUsers wick
```

This means even if someone somehow got a valid key, they'd still need to be logging in as the right user.

## Is it enough?

Honestly? For a personal server or small production setup, yes, this gets you very far. The vast majority of attacks on public servers are automated and opportunistic. They're looking for easy targets: default credentials, open ports, unpatched services. Following these steps makes you a much harder target than most.

The bots are still knocking. They always will be. But now I actually know what's going on, and nothing's getting through.

**Code, Peace and Love**